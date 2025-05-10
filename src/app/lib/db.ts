import mongoose from "mongoose";
// Import models to ensure they are registered
import "./models";

// Get MongoDB URI from environment or throw error if missing
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Now TypeScript knows MONGODB_URI is definitely a string
const connectionString: string = MONGODB_URI;

console.log(
  "[DB] Connecting to MongoDB:",
  connectionString.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    "mongodb$1://**:**@"
  )
);

interface Cached {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Use a module-scoped variable instead of global
const cached: Cached = {
  conn: null,
  promise: null,
};

export async function connectToDatabase(): Promise<mongoose.Connection> {
  // If connection exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If connection promise doesn't exist, create it
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      connectTimeoutMS: 30000, // Increase connection timeout
      socketTimeoutMS: 45000,
    };

    // Store connection promise
    cached.promise = mongoose
      .connect(connectionString, opts)
      .then((mongoose) => {
        console.log("[DB] MongoDB connected successfully");
        return mongoose.connection;
      });
  }

  try {
    // Await the connection
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error to allow retrying
    cached.promise = null;
    console.error("[DB] MongoDB connection error:", e);

    // Return a more user-friendly error
    const error = new Error(
      "Could not connect to MongoDB. Please check your connection string and make sure your database is running."
    );
    error.name = "MongoConnectionError";
    throw error;
  }

  return cached.conn;
}
