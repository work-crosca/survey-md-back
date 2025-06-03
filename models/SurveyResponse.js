import mongoose from "mongoose";

const SurveyResponseSchema = new mongoose.Schema({
  token: { type: String, required: true },
  lang: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
  userAgent: String,
  answers: { type: Array, default: [] },
  campanie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
  },
});

export default mongoose.model("SurveyResponse", SurveyResponseSchema);