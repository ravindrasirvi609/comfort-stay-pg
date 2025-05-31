import { NextResponse } from "next/server";
import { isAuthenticated, isAdmin } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import Payment from "@/app/api/models/Payment";
import User from "@/app/api/models/User"; // Import the User model
import Room from "@/app/api/models/Room";
import path from "path";
import fs from "fs";
import { tmpdir } from "os";
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

    // Important: Register all models before using them
    Room; // Just reference it to ensure it's registered
    User; // Ensure User model is registered
    Payment; // Ensure Payment model is also registered

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
              border: 1px solid #e0e0e0;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              border-radius: 8px;
            }
            .receipt-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              border-bottom: 2px solid #f3f3f3;
              padding-bottom: 20px;
            }
            .brand {
              display: flex;
              flex-direction: column;
              max-width: 60%;
            }
            .brand-name {
              font-size: 28px;
              font-weight: bold;
              color: #d53f8c;
              letter-spacing: 0.5px;
            }
            .brand-slogan {
              font-size: 14px;
              color: #71706e;
              margin-top: 2px;
            }
            .brand-address {
              font-size: 11px;
              color: #71706e;
              margin-top: 8px;
              max-width: 300px;
              line-height: 1.5;
            }
            .brand-contact {
              font-size: 11px;
              color: #71706e;
              margin-top: 5px;
              display: flex;
              align-items: center;
            }
            .receipt-number {
              background-color: #fdf2f8;
              padding: 10px 15px;
              border-radius: 6px;
              border-left: 4px solid #d53f8c;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .receipt-title {
              text-align: center;
              font-size: 24px;
              margin: 25px 0;
              color: #333;
              position: relative;
            }
            .receipt-title:after {
              content: '';
              display: block;
              width: 80px;
              height: 3px;
              background: linear-gradient(to right, #d53f8c, #f6a5c1);
              margin: 8px auto 0;
              border-radius: 2px;
            }
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .receipt-section {
              margin-bottom: 20px;
              flex: 1;
              min-width: 280px;
              background-color: #fafafa;
              padding: 15px;
              border-radius: 6px;
              margin: 0 5px 10px;
            }
            .receipt-section h3 {
              font-size: 16px;
              margin-bottom: 15px;
              color: #555;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
              position: relative;
            }
            .receipt-section h3:before {
              content: '';
              position: absolute;
              left: 0;
              bottom: -1px;
              width: 40px;
              height: 2px;
              background-color: #d53f8c;
            }
            .receipt-detail {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
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
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .receipt-table th, 
            .receipt-table td {
              border: 1px solid #e0e0e0;
              padding: 12px 15px;
              text-align: left;
            }
            .receipt-table th {
              background-color: #f6f9fc;
              font-weight: 600;
              color: #555;
              border-bottom: 2px solid #d53f8c;
            }
            .receipt-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .receipt-table tr:hover {
              background-color: #f1f1f1;
            }
            .receipt-total {
              display: flex;
              justify-content: flex-end;
              margin-top: 20px;
              font-size: 18px;
              font-weight: bold;
              background-color: #f6f9fc;
              padding: 12px 15px;
              border-radius: 4px;
            }
            .receipt-total .value {
              min-width: 120px;
              color: #d53f8c;
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
              color: #777;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .logo-placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 60px;
              height: 60px;
              background: #d53f8c;
              border-radius: 50%;
              color: white;
              font-weight: bold;
              font-size: 24px;
              margin-bottom: 10px;
            }
            .receipt-logo {
              position: absolute;
              bottom: 20px;
              right: 40px;
              opacity: 0.05;
              width: 200px;
              height: 200px;
              z-index: -1;
            }
            .qr-code {
              text-align: center;
              margin-top: 30px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-placeholder {
              width: 100px;
              height: 100px;
              border: 1px dashed #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #999;
              margin-bottom: 8px;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 90px;
              opacity: 0.03;
              color: #d53f8c;
              z-index: -1;
              white-space: nowrap;
              font-weight: bold;
            }
            .signature-section {
              display: flex;
              justify-content: flex-end;
              margin-top: 60px;
              border-top: 1px dashed #ccc;
              padding-top: 15px;
              font-size: 12px;
              text-align: center;
            }
            .signature-box {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 200px;
            }
            .signature-line {
              width: 100%;
              height: 1px;
              background-color: #333;
              margin-bottom: 5px;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .receipt {
                box-shadow: none;
                border: none;
              }
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
                <div class="brand-address">
                  Hinjewadi Phase 1 Rd, Mukai Nagar, Phase 1, 
                  Hinjawadi Rajiv Gandhi Infotech Park, 
                  Hinjawadi, Pune, Pimpri-Chinchwad, Maharashtra 411057
                </div>
                <div class="brand-contact">
                  <span style="margin-right: 10px;">📞 +91 9922 538 989</span>
                  <span style="margin-right: 10px;">✉️ info@comfortstay.com</span>
                  <span>🌐 www.comfortstaypg.com</span>
                </div>
              </div>
              <div>
                <div class="receipt-number">Receipt #: ${payment.receiptNumber}</div>
                <div style="font-size: 14px; color: #666;">Date: ${formatDate(payment.paymentDate)}</div>
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
                  <div class="label">PG ID:</div>
                  <div class="value">${payment.userId.pgId}</div>
                </div>
                ${
                  payment.userId.roomId
                    ? `
                <div class="receipt-detail">
                  <div class="label">Room No.:</div>
                  <div class="value">${payment.userId.roomId.roomNumber}</div>
                </div>
                `
                    : ""
                }
                <div class="receipt-detail">
                  <div class="label">Email:</div>
                  <div class="value">${payment.userId.email}</div>
                </div>
                <div class="receipt-detail">
                  <div class="label">Phone:</div>
                  <div class="value">${payment.userId.phone}</div>
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
            
            <div class="receipt-section" style="width: auto; margin: 30px 0;">
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
                    <td>${payment.isDepositPayment ? "Booking harge" : "Monthly Rent"}</td>
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
              <p style="margin-top: 10px; color: #d53f8c;">Thank you for choosing Comfort Stay PG!</p>
              <p style="margin-top: 5px; font-size: 11px;">Visit us at: <a href="https://www.comfortstaypg.com" style="color: #d53f8c; text-decoration: none;">www.comfortstaypg.com</a></p>
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
