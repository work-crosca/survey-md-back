import mongoose from "mongoose";

const SurveyResponseSchema = new mongoose.Schema({
  token: String,
  lang: String,
  answers: Object,
  userAgent: String,
  completedAt: Date,
});

export default mongoose.model("SurveyResponse", SurveyResponseSchema);