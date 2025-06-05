import express from "express";
import AdminUser from "../models/AdminUser.js";
import { createToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { sendNotification } from "../utils/sendNotification.js";

const router = express.Router();

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await AdminUser.findOne({ email });
  if (!user || !(await user.validatePassword(password))) {
    return res.status(401).json({ message: "Email sau parolă greșită" });
  }

  const token = createToken(user);

  res.setHeader("Access-Control-Allow-Origin", "https://survey.getcookie.xyz");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 8 * 60 * 60 * 1000,
    })
    .json({ success: true });
});
// GET /me
router.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

// POST /logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.json({ success: true });
});

// PATCH /update (actualizează propriul profil)
router.patch("/update", requireAuth, async (req, res) => {
  const { name, company, avatar, roles } = req.body;

  try {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (company !== undefined) updates.company = company;
    if (avatar !== undefined) updates.avatar = avatar;

    // Permitem update la roluri doar dacă userul curent are deja acest câmp
    if (Array.isArray(roles) && req.user.roles?.includes("Admin")) {
      updates.roles = roles;
    }

    const updated = await AdminUser.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    await sendNotification(
      {
        userId: req.user._id,
        title: "Profil actualizat",
        message: "Profilul tău a fost actualizat cu succes.",
      },
      req.app.get("io")
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Eroare la actualizarea profilului" });
  }
});

export default router;
