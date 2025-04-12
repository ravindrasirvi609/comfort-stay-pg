import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

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
    };

    // Store connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    // Await the connection
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error to allow retrying
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
