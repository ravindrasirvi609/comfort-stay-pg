import { NextRequest, NextResponse } from "next/server";
import Subscriber from "@/app/api/models/Subscriber";
import { connectToDatabase } from "@/app/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const id = (await params).id;
    const body = await request.json();

    // Find and update the subscriber
    const updatedSubscriber = await Subscriber.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!updatedSubscriber) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscriber updated successfully",
        subscriber: updatedSubscriber,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update subscriber error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update subscriber",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const id = (await params).id;

    // Instead of permanently deleting, mark as inactive
    const subscriber = await Subscriber.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Unsubscribed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
