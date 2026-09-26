import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { exportActivityCsv, getActivity } from "../../controllers/activityController.js";

const router = express.Router();
router.use(protect);
router.get("/export.csv", exportActivityCsv);
router.get("/", getActivity);
export default router;
