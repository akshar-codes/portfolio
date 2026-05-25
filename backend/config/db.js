import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  console.error("FATAL: MONGO_URI is not set in environment variables.");
  process.exit(1);
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
