import { NextRequest, NextResponse } from "next/server";
import ContactInquiry from "@/app/api/models/ContactInquiry";
import { connectToDatabase } from "@/app/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const id = (await params).id;
    const body = await request.json();

    // Find and update the inquiry
    const updatedInquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!updatedInquiry) {
      return NextResponse.json(
        { success: false, message: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry updated successfully",
        inquiry: updatedInquiry,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update contact inquiry error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const id = (await params).id;

    // Find the inquiry by ID
    const inquiry = await ContactInquiry.findById(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, inquiry }, { status: 200 });
  } catch (error: any) {
    console.error("Get contact inquiry error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to get inquiry" },
      { status: 500 }
    );
  }
}
