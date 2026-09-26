import mongoose from "mongoose";

const portfolioAnalyticsEventSchema = new mongoose.Schema({
  type: { type: String, enum: ["page_view", "download", "contact_request", "project_view"], required: true, index: true },
  visitorId: { type: String, required: true, maxlength: 40, index: true },
  sessionId: { type: String, required: true, maxlength: 40, index: true },
  page: { type: String, required: true, maxlength: 160 },
  referrer: { type: String, default: "Direct", maxlength: 160, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

portfolioAnalyticsEventSchema.index({ createdAt: -1, type: 1 });
portfolioAnalyticsEventSchema.index({ createdAt: -1, visitorId: 1, sessionId: 1 });

export default mongoose.model("PortfolioAnalyticsEvent", portfolioAnalyticsEventSchema);
