import { config } from "dotenv";
import * as path from "path";
import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env.local") });

import { hashPassword } from "../app/lib/auth";
import { connectToDatabase } from "../app/lib/db";
import User from "@/app/api/models/User";

async function createAdmin() {
  try {
    await connectToDatabase();

    const email = "XXXX@gmail.com";
    const password = "XXX";

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists.");
      return;
    }

    const hashedPassword = await hashPassword(password);

    const admin = new User({
      name: "ComfortStay Admin",
      email,
      phone: "0000000000",
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
    console.log("Admin created successfully.");
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

createAdmin().then(() => process.exit());
