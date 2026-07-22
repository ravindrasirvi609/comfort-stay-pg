import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import { hashPassword, generatePassword } from "@/app/lib/auth";
import { sendResetCredentialsEmail } from "@/app/lib/email";
import User from "@/app/api/models/User";

// Simple in-memory rate-limiter (per-process) to prevent enumeration/spam.
// Key = normalized email, value = last-request timestamp.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const rateLimitMap: Map<string, number> = (globalThis as any).__forgotPwLimit ||
  ((globalThis as any).__forgotPwLimit = new Map<string, number>());

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail: unknown = body?.email;

    if (typeof rawEmail !== "string" || !isValidEmail(rawEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    const email = normalizeEmail(rawEmail);

    // Rate-limit per email
    const now = Date.now();
    const last = rateLimitMap.get(email);
    if (last && now - last < RATE_LIMIT_WINDOW_MS) {
      const remaining = Math.ceil(
        (RATE_LIMIT_WINDOW_MS - (now - last)) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${remaining}s before trying again.`,
        },
        { status: 429 }
      );
    }
    rateLimitMap.set(email, now);

    await connectToDatabase();

    // Find user by email (case-insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    // ── Security: always return a generic success response so we don't
    // leak which emails exist. Only perform reset when user is a valid,
    // approved, active account with a pgId.
    const genericSuccess = NextResponse.json({
      success: true,
      message:
        "If an account exists for that email, we've sent new credentials.",
    });

    if (!user) return genericSuccess;

    // Only reset for approved & active accounts
    if (user.registrationStatus && user.registrationStatus !== "Approved") {
      return genericSuccess;
    }
    if (user.isActive === false) {
      return genericSuccess;
    }
    if (!user.pgId) {
      // Account not fully provisioned yet
      return genericSuccess;
    }

    // Generate + persist + email new credentials
    const plainPassword = generatePassword();
    const hashed = await hashPassword(plainPassword);

    user.password = hashed;
    await user.save();

    try {
      await sendResetCredentialsEmail(
        user.name,
        user.email,
        user.pgId,
        plainPassword,
        user._id
      );
    } catch (mailErr) {
      console.error("[forgot-password] email failed:", mailErr);
      // We still return success to avoid enumeration; admin can help manually.
    }

    return genericSuccess;
  } catch (error) {
    console.error("[forgot-password] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
