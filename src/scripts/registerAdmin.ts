// Interactive Admin Registration Script
// Usage examples:
//   npm run register-admin -- --email=admin@example.com --name="Main Admin"
//   npm run register-admin (then follow prompts)
//   npm run register-admin -- --email=admin@example.com --generate-password

import { config } from "dotenv";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import readline from "readline";

// ----------------- ENV LOADING -----------------
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env.local from project root (where npm run executed)
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  config({ path: envPath });
  console.log(`[register-admin] Loaded environment from ${envPath}`);
} else {
  console.warn(
    `[register-admin] No .env.local at ${envPath}. Will rely on --uri flag or existing environment variables.`
  );
}

// ----------------- IMPORTS -----------------
// Import only modules that don't need DB yet; we'll import DB connector dynamically later.
import { hashPassword, generatePassword } from "../app/lib/auth";
import User from "@/app/api/models/User";

// ----------------- TYPES -----------------
interface AdminInput {
  name: string;
  email: string;
  phone: string;
  password?: string;
  generatePassword?: boolean;
  resetPassword?: boolean;
}

// ----------------- ARG PARSER -----------------
function parseArgs(): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (const raw of process.argv.slice(2)) {
    if (raw.startsWith("--")) {
      const [key, ...rest] = raw.replace(/^--/, "").split("=");
      if (rest.length) {
        args[key] = rest.join("=");
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

// ----------------- PROMPT FUNCTION -----------------
function prompt(
  question: string,
  opts: { hidden?: boolean } = {}
): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  if (!opts.hidden) {
    return new Promise((resolve) =>
      rl.question(question, (ans) => {
        rl.close();
        resolve(ans.trim());
      })
    );
  }
  // Hidden input
  return new Promise((resolve) => {
    process.stdout.write(question);
    const chars: string[] = [];
    const onData = (data: Buffer) => {
      const char = data.toString();
      if (char === "\n" || char === "\r") {
        process.stdout.write("\n");
        process.stdin.off("data", onData);
        rl.close();
        resolve(chars.join("").trim());
      } else if (char === "\u0003") {
        process.stdin.off("data", onData);
        rl.close();
        process.exit(1);
      } else if (char === "\b" || char === "\x7f") {
        chars.pop();
      } else {
        chars.push(char);
      }
    };
    process.stdin.on("data", onData);
  });
}

// ----------------- INPUT GATHERING -----------------
async function gatherInput(): Promise<AdminInput> {
  const args = parseArgs();
  const input: AdminInput = {
    name: (args.name as string) || "Comfort Admin",
    email: (args.email as string) || "",
    phone: (args.phone as string) || "0000000000",
    password: (args.password as string) || undefined,
    generatePassword: Boolean(args["generate-password"] || args.gp),
    resetPassword: Boolean(args["reset-password"] || args.reset),
  };

  if (!input.email) {
    input.email = await prompt("Admin email: ");
  }
  if (!input.password && !input.generatePassword) {
    const manual = await prompt(
      "Enter password (leave blank to auto-generate): ",
      { hidden: true }
    );
    if (manual) {
      input.password = manual;
    } else {
      input.generatePassword = true;
    }
  }
  if (input.generatePassword) {
    input.password = generatePassword();
  }
  return input;
}

// ----------------- MAIN -----------------
async function main() {
  console.log("[register-admin] Starting admin registration...\n");

  // Allow --uri flag to override
  const earlyArgs = parseArgs();
  if (earlyArgs.uri && typeof earlyArgs.uri === "string") {
    process.env.MONGODB_URI = earlyArgs.uri;
    console.log(`[register-admin] Using Mongo URI from --uri flag`);
  }

  // Check if MONGODB_URI exists
  if (!process.env.MONGODB_URI) {
    console.error("\nERROR: MONGODB_URI not set.\n");
    if (process.stdin.isTTY) {
      const entered = await prompt(
        "Enter MongoDB URI (or leave blank to exit): "
      );
      if (entered) {
        process.env.MONGODB_URI = entered;
      } else {
        console.error("No URI provided. Aborting.");
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  const input = await gatherInput();

  // Dynamically import DB connector AFTER ensuring env is set
  const { connectToDatabase } = await import("../app/lib/db");
  await connectToDatabase();

  // Check existing admin
  const existing = await User.findOne({ email: input.email });

  if (existing) {
    if (existing.role !== "admin") {
      console.error(
        `A user with email ${input.email} already exists but is not an admin (role=${existing.role}). Aborting.`
      );
      process.exit(1);
    }
    if (!input.resetPassword) {
      console.log(
        `Admin with email ${input.email} already exists. Use --reset-password to set a new password.`
      );
      process.exit(0);
    }
    existing.password = await hashPassword(input.password!);
    existing.isActive = true;
    existing.registrationStatus = "Approved";
    await existing.save();
    console.log("\nAdmin password reset successfully:");
    console.log(`Email:    ${input.email}`);
    console.log(`Password: ${input.password}`);
    console.log("IMPORTANT: Store this password securely.\n");
    process.exit(0);
  }

  // Create new admin
  const hashedPassword = await hashPassword(input.password!);
  const admin = new User({
    name: input.name,
    email: input.email,
    phone: input.phone,
    role: "admin",
    password: hashedPassword,
    isActive: true,
    fathersName: "-",
    permanentAddress: "-",
    city: "-",
    state: "-",
    guardianMobileNumber: "-",
    validIdType: "Aadhar Card",
    validIdPhoto: "-",
    profileImage: "-",
    companyName: "-",
    companyAddress: "-",
    employeeId: "-",
    agreeToTerms: true,
    registrationStatus: "Approved",
  });

  await admin.save();
  console.log("\nAdmin created successfully:");
  console.log(`Email:    ${input.email}`);
  console.log(`Password: ${input.password}`);
  console.log("IMPORTANT: Store this password securely.\n");
  process.exit(0);
}

// ----------------- RUN -----------------
main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
