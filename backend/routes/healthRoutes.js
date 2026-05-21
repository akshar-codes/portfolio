import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: Math.floor(process.uptime()), // seconds since process start
    timestamp: new Date().toISOString(),
  });
});

export default router;
