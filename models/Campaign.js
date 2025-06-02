import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

export default mongoose.model("Campaign", CampaignSchema);