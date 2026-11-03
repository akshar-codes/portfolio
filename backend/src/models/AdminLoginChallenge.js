import mongoose from "mongoose";

const adminLoginChallengeSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  challengeTokenHash: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

adminLoginChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AdminLoginChallenge", adminLoginChallengeSchema);
