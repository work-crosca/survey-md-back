import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import surveyRoutes from "./routes/survey.js";
import adminRoutes from "./routes/admin.js";
import campaignsRoutes from "./routes/campaigns.js";
import questionsRoutes from "./routes/questions.js";
import cookieParser from "cookie-parser";
import notificationRoutes from "./routes/notifications.js";

import { Server } from "socket.io";
import registerNotificationSocket from "./sockets/notificationSocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app); 

const allowedOrigins = ["https://survey.getcookie.xyz", "http://localhost:5173"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Inițializează sockets
registerNotificationSocket(io);
app.set("io", io);
global.ioInstance = io;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Originul nu este permis de CORS"));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
  
app.use("/api/notifications", notificationRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/campaigns", campaignsRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});