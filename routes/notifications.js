import express from "express";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// ✅ Obține notificările pentru utilizatorul curent
router.get("/", requireAuth, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// ✅ Marchează o notificare ca citită
router.patch("/:id/read", requireAuth, async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ error: "Notificare inexistentă" });
  res.json(notification);
});

// ✅ Marchează toate notificările ca citite
router.patch("/read-all", requireAuth, async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});

export default router;