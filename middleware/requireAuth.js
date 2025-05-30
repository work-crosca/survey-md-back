import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";

export const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Neautentificat" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AdminUser.findById(payload.id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Utilizator inexistent" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(403).json({ message: "Token invalid sau expirat" });
  }
};