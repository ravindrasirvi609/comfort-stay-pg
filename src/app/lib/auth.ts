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

// Verify JWT token
export function verifyToken(token: string): UserData | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserData;
  } catch {
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
