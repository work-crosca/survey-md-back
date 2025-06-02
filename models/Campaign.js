import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  color: { type: String, default: "#8B5CF6" }, 
  active: { type: Boolean, default: true },
});

export default mongoose.model("Campaign", CampaignSchema);