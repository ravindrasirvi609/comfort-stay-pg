import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../lib/auth";

export async function GET() {
  try {
    const { isAuth, user } = await isAuthenticated();

    if (isAuth && user) {
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          pgId: user.pgId,
        },
      });
    }

    return NextResponse.json({
      isAuthenticated: false,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        error: "Failed to check authentication status",
      },
      { status: 500 }
    );
  }
}
