import { NextResponse } from "next/server";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import Payment from "@/app/api/models/Payment";
import path from "path";
import fs from "fs";
import { tmpdir } from "os";
import Room from "@/app/api/models/Room"; // Adjust the path as needed
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

// Set Node.js runtime for file operations
export const runtime = "nodejs";

// Interface for the populated payment document
interface PopulatedPayment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    pgId: string;
    phone: string;
    roomId?: {
      _id: string;
      roomNumber: string;
      type: string;
      price: number;
    };
  };
  amount: number;
  months: string[];
  paymentStatus?: string;
  status?: string;
  paymentDate: string;
  receiptNumber: string;
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
  isDepositPayment?: boolean;
}

// For Next.js 15.3.0, we need to use this specific signature
export async function GET(request: Request, context: unknown) {
  try {
    await connectToDatabase();

    // Important: Register the Room model before using it
    Room; // Just reference it to ensure it's registered

    // Extract the payment ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 2]; // Get the ID from the URL path

    // Check if user is authenticated
    const { isAuth, user } = await isAuthenticated();

    if (!isAuth || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get payment details
    const paymentDoc = await Payment.findById(id)
      .populate({
        path: "userId",
        select: "name email pgId phone roomId",
        populate: {
          path: "roomId",
          select: "roomNumber type price",
        },
      })
      .lean();

    if (!paymentDoc) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Cast to our interface for type safety
    const payment = paymentDoc as unknown as PopulatedPayment;

    // Check if the user has permission to access this payment
    if (
      !isAdmin(user) &&
      payment.userId._id.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to access this payment",
        },
        { status: 403 }
      );
    }

    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Generate receipt HTML
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Payment Receipt</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              color: #444;
              background-color: #fff;
            }
            .receipt {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              position: relative;
            }
            .receipt-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #f3f3f3;
              padding-bottom: 20px;
            }
            .brand {
              display: flex;
              flex-direction: column;
            }
            .brand-name {
              font-size: 28px;
              font-weight: bold;
              color: #d53f8c;
            }
            .brand-slogan {
              font-size: 14px;
              color: #777;
            }
            .receipt-title {
              text-align: center;
              font-size: 24px;
              margin: 20px 0;
              color: #333;
            }
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .receipt-section {
              margin-bottom: 20px;
            }
            .receipt-section h3 {
              font-size: 16px;
              margin-bottom: 10px;
              color: #666;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .receipt-detail {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 14px;
            }
            .label {
              color: #777;
              width: 40%;
            }
            .value {
              font-weight: 500;
              color: #333;
              width: 60%;
              text-align: right;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .receipt-table th, 
            .receipt-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .receipt-table th {
              background-color: #f9f9f9;
              font-weight: 600;
              color: #555;
            }
            .receipt-total {
              display: flex;
              justify-content: flex-end;
              margin-top: 20px;
              font-size: 18px;
              font-weight: bold;
            }
            .receipt-total .value {
              min-width: 100px;
            }
            .status {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
            }
            .status-paid {
              background-color: #e6f7e6;
              color: #36a936;
            }
            .status-due {
              background-color: #fff2cc;
              color: #e69d00;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .receipt-logo {
              position: absolute;
              bottom: 20px;
              right: 40px;
              opacity: 0.1;
              width: 200px;
              height: 200px;
              z-index: -1;
            }
            .qr-code {
              text-align: center;
              margin-top: 20px;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              opacity: 0.03;
              color: #000;
              z-index: -1;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="watermark">COMFORT STAY PG</div>
            <div class="receipt-header">
              <div class="brand">
                <div class="brand-name">COMFORT STAY PG</div>
                <div class="brand-slogan">Your Home Away From Home</div>
              </div>
              <div>
                <div style="font-weight: bold;">Receipt #: ${payment.receiptNumber}</div>
                <div>Date: ${formatDate(payment.paymentDate)}</div>
              </div>
            </div>
            
            <h1 class="receipt-title">PAYMENT RECEIPT</h1>
            
            <div class="receipt-info">
              <div class="receipt-section">
                <h3>Resident Information</h3>
                <div class="receipt-detail">
                  <div class="label">Name:</div>
                  <div class="value">${payment.userId.name}</div>
                </div>
                <div class="receipt-detail">
                  <div class="label">ID:</div>
                  <div class="value">${payment.userId.pgId}</div>
                </div>
                <div class="receipt-detail">
                  <div class="label">Email:</div>
                  <div class="value">${payment.userId.email}</div>
                </div>
                <div class="receipt-detail">
                  <div class="label">Phone:</div>
                  <div class="value">${payment.userId.phone}</div>
                </div>
                <div class="receipt-detail">
                  <div class="label">Room:</div>
                  <div class="value">${payment.userId.roomId ? payment.userId.roomId.roomNumber : "N/A"}</div>
                </div>
              </div>
              
              <div class="receipt-section">
                <h3>Payment Details</h3>
                <div class="receipt-detail">
                  <div class="label">Amount:</div>
                  <div class="value">₹${payment.amount.toLocaleString("en-IN")}</div>
                </div>
                <div class="receipt-detail">
                  <div class="label">Payment Date:</div>
                  <div class="value">${formatDate(payment.paymentDate)}</div>
                </div>
                <div class="receipt-detail">
                  <div class="label">Payment Method:</div>
                  <div class="value">${payment.paymentMethod}</div>
                </div>
                <div class="receipt-detail">
                  <div class="label">Status:</div>
                  <div class="value">
                    <span class="status ${(payment.paymentStatus || payment.status) === "Paid" ? "status-paid" : "status-due"}">
                      ${payment.paymentStatus || payment.status}
                    </span>
                  </div>
                </div>
                ${
                  payment.transactionId
                    ? `
                <div class="receipt-detail">
                  <div class="label">Transaction ID:</div>
                  <div class="value">${payment.transactionId}</div>
                </div>
                `
                    : ""
                }
              </div>
            </div>
            
            <div class="receipt-section">
              <h3>Payment Description</h3>
              <table class="receipt-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Period</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${payment.isDepositPayment ? "Security Deposit" : "Monthly Rent"}</td>
                    <td>${payment.months && payment.months.length > 0 ? payment.months.join(", ") : "N/A"}</td>
                    <td>₹${payment.amount.toLocaleString("en-IN")}</td>
                  </tr>
                  ${
                    payment.remarks
                      ? `
                  <tr>
                    <td colspan="3" style="font-style: italic; color: #666;">
                      Note: ${payment.remarks}
                    </td>
                  </tr>
                  `
                      : ""
                  }
                </tbody>
              </table>
              
              <div class="receipt-total">
                <div class="label">Total Amount:</div>
                <div class="value">₹${payment.amount.toLocaleString("en-IN")}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>This is a computer-generated receipt and does not require a signature.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Generate PDF with puppeteer/chromium
    let browser = null;
    try {
      // Check if we're in development or production environment
      const isDev = process.env.NODE_ENV === "development";

      if (isDev) {
        // In development, we can use local Chrome
        const puppeteerLocal = require("puppeteer");
        browser = await puppeteerLocal.launch();
      } else {
        // In production (Vercel), use @sparticuz/chromium
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
      }

      const page = await browser.newPage();
      await page.setContent(receiptHtml, { waitUntil: "networkidle0" });

      // Create temp file path
      const tempFilePath = path.join(
        tmpdir(),
        `receipt-${payment.receiptNumber}.pdf`
      );

      // Generate PDF
      await page.pdf({
        path: tempFilePath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      });

      // Read the generated PDF
      const pdfBuffer = fs.readFileSync(tempFilePath);

      // Clean up
      fs.unlinkSync(tempFilePath);
      await browser.close();

      // Return the PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="receipt-${payment.receiptNumber}.pdf"`,
        },
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (browser) {
        await browser.close();
      }
      return NextResponse.json(
        {
          success: false,
          message: `Failed to generate receipt: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API] Receipt generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to generate receipt: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
