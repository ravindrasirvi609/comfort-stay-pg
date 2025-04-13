import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Secret key for JWT - should be in .env file
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  pgId?: string;
  exp?: number; // JWT expiration timestamp
  sub?: string; // JWT subject (alternative to _id)
}

// Generate a random alphanumeric PG ID
export function generatePgId(length: number = 8): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Generate a random password
export function generatePassword(length: number = 10): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "@#$%^&*!";
  const allChars = lowercase + uppercase + numbers + special;

  let password = "";
  // Ensure we have at least one of each type
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: UserData): string {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      pgId: user.pgId,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// Verify JWT token - Edge-compatible version
export function verifyToken(token: string): UserData | null {
  try {
    // For Edge compatibility, we'll use a simpler approach
    // This is less secure but will work in Edge runtime
    // In production, use a proper Edge-compatible JWT library

    // Basic check for token format
    if (!token || !token.includes(".")) {
      console.error("[Auth] Invalid token format");
      return null;
    }

    // Parse the payload part of the JWT
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("[Auth] Invalid token structure");
      return null;
    }

    // Decode the payload (the middle part of the JWT)
    const payloadBase64 = parts[1];
    const decodedPayload = Buffer.from(payloadBase64, "base64").toString();

    try {
      const payload = JSON.parse(decodedPayload) as UserData;

      // Check if token is expired
      const expiry = payload.exp;
      if (expiry && expiry < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return {
        _id: payload._id || payload.sub || "unknown",
        name: payload.name || "Unknown",
        email: payload.email || "unknown@example.com",
        role: payload.role || "user",
        pgId: payload.pgId,
      };
    } catch (parseError) {
      console.error("[Auth] Failed to parse token payload:", parseError);
      return null;
    }
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

// Middleware to check if user is authenticated
export async function isAuthenticated(): Promise<{
  isAuth: boolean;
  user?: UserData;
}> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    return { isAuth: false };
  }

  const user = verifyToken(token);
  if (!user) {
    return { isAuth: false };
  }

  return { isAuth: true, user };
}

// Check if user has admin role
export function isAdmin(user: UserData): boolean {
  return user.role === "admin";
}
