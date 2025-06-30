// Set environment variables directly BEFORE any imports
process.env.MONGODB_URI =
  "mongodb+srv://your-actual-mongodb-connection-string-here";

// Only after setting environment variables, import your modules
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define a simple user schema if needed
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String,
  password: String,
  isActive: Boolean,
  fathersName: String,
  permanentAddress: String,
  city: String,
  state: String,
  guardianMobileNumber: String,
  validIdType: String,
  validIdPhoto: String,
  profileImage: String,
  companyName: String,
  companyAddress: String,
  employeeId: String,
  agreeToTerms: Boolean,
  registrationStatus: String,
});

// Create the User model directly
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Hash password function
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function createManager() {
  console.log("Starting createManager function...");
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const email = "XXXX@gmail.com";
    const password = "XXXX";

    // Check if manager exists
    console.log(`Checking for existing user with email: ${email}`);
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Manager already exists.");
      return;
    }

    console.log("No existing manager found, creating new one...");

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);

    // Create manager
    console.log("Creating user object...");
    const manager = new User({
      name: "ComfortStay Manager",
      email,
      phone: "0000000001",
      role: "manager",
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

    console.log("Saving manager to database...");
    await manager.save();
    console.log("Manager created successfully!");
  } catch (error) {
    console.error("Error creating manager:", error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("Database connection closed");
    }
    process.exit(0);
  }
}

// Execute the function
createManager();
