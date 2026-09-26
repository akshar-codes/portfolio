import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null, index: true },
  actorName: { type: String, required: true, maxlength: 80, index: true },
  action: {
    type: String,
    required: true,
    enum: ["create", "update", "delete", "publish", "unpublish", "login", "logout", "media_upload"],
    index: true,
  },
  resource: { type: String, default: "admin", maxlength: 80, index: true },
  resourceId: { type: String, default: "", maxlength: 100 },
  description: { type: String, required: true, maxlength: 300 },
  ip: { type: String, default: "", maxlength: 64, index: true },
  method: { type: String, default: "", maxlength: 10 },
  path: { type: String, default: "", maxlength: 300 },
}, { timestamps: { createdAt: true, updatedAt: false } });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actorName: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
