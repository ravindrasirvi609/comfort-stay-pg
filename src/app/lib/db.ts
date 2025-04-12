import mongoose from "mongoose";

// Use hardcoded MongoDB URI as fallback for development
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/comfortstay";

console.log(
  "[DB] Connecting to MongoDB:",
  MONGODB_URI.replace(
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
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Store connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
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
