import mongoose from "mongoose";

const contentVersionSchema = new mongoose.Schema({
  resource: { type: String, required: true, index: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, immutable: true, index: true },
}, { versionKey: false });

contentVersionSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
export default mongoose.model("ContentVersion", contentVersionSchema);
