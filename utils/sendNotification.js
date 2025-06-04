// utils/sendNotification.js
import Notification from "../models/Notification.js";

export async function sendNotification({ userId, title, message }) {
  try {
    const notification = new Notification({ userId, title, message });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Eroare la trimiterea notificării:", err);
  }
}