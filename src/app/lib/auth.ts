import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

// Secret key for JWT - should be in .env file
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
// Convert the secret to the format expected by jose
const JWT_SECRET_BYTES = new TextEncoder().encode(JWT_SECRET);

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

// Edge-compatible password hashing (simulated for demo)
// Note: In production, use a proper edge-compatible hashing solution
export async function hashPassword(password: string): Promise<string> {
  // This is a simplified hash for Edge compatibility
  // WARNING: This is NOT secure for production use
  // For production, consider using a service like Auth.js or a serverless function
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Compare password
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // Compare with our simplified hash
  const newHash = await hashPassword(password);
  return newHash === hashedPassword;
}

// Generate JWT token - Edge compatible
export async function generateToken(user: UserData): Promise<string> {
  // Create a JWT using jose library (Edge compatible)
  const token = await new SignJWT({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    pgId: user.pgId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(JWT_SECRET_BYTES);

  return token;
}

// Verify JWT token - Edge-compatible version
export async function verifyToken(token: string): Promise<UserData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);

    return {
      _id: (payload._id as string) || (payload.sub as string) || "unknown",
      name: (payload.name as string) || "Unknown",
      email: (payload.email as string) || "unknown@example.com",
      role: (payload.role as string) || "user",
      pgId: payload.pgId as string | undefined,
    };
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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { isAuth: false };
  }

  const user = await verifyToken(token);
  if (!user) {
    return { isAuth: false };
  }

  return { isAuth: true, user };
}

// Check if user has admin role
export function isAdmin(user: UserData): boolean {
  return user.role === "admin";
}
