import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  console.error("FATAL: MONGO_URI is not set in environment variables.");
  process.exit(1);
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const conn = await mongoose.connect(process.env.MONGO_URI);

  isConnected = true;
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
