import { NextRequest, NextResponse } from "next/server";
import VisitRequest from "@/app/api/models/VisitRequest";
import { connectToDatabase } from "@/app/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const id = params.id;
    const body = await request.json();

    // Find and update the visit request
    const updatedVisitRequest = await VisitRequest.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!updatedVisitRequest) {
      return NextResponse.json(
        { success: false, message: "Visit request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Visit request updated successfully",
        visitRequest: updatedVisitRequest,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update visit request error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update visit request",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const id = params.id;

    // Find the visit request by ID
    const visitRequest = await VisitRequest.findById(id);

    if (!visitRequest) {
      return NextResponse.json(
        { success: false, message: "Visit request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, visitRequest }, { status: 200 });
  } catch (error: any) {
    console.error("Get visit request error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get visit request",
      },
      { status: 500 }
    );
  }
}
