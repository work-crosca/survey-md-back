import express from "express";
import AdminUser from "../models/AdminUser.js";
import { createToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/requireAuth.js";

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

export default router;