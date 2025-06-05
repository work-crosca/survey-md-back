// utils/sendNotification.js
import Notification from "../models/Notification.js";

export async function sendNotification({ userId, title, message }, io = null) {
  try {
    const notification = new Notification({ userId, title, message });
    await notification.save();

    // Trimite în timp real prin socket dacă există acces la io
    if (io) {
      io.sendNotificationTo?.(userId, notification);
    }

    return notification;
  } catch (err) {
    console.error("Eroare la trimiterea notificării:", err);
  }
}