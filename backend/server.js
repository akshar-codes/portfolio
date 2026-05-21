import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const start = async () => {
  // 1. Database must be ready before accepting HTTP traffic
  await connectDB();

  // 2. Only bind the port once the DB connection is confirmed
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
