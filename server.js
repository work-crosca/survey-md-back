import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import surveyRoutes from "./routes/survey.js";
import adminRoutes from "./routes/admin.js";
import campaignsRoutes from "./routes/campaigns.js";
import cookieParser from "cookie-parser";
dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const allowedOrigins = ["https://survey.getcookie.xyz/"]; // sau domeniul tău frontend

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // 🔐 permite cookie-urile
  })
);
app.use(cookieParser());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/campaigns", campaignsRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});