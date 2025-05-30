import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; // sau bcryptjs dacă ai ales acea variantă
import AdminUser from "../models/AdminUser.js";

dotenv.config();

const createAdminUser = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("⚠️  Setează MONGODB_URI în .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Conectat la MongoDB");

  const email = "c.rosca@moldcell.md";
  const name = "Corneliu Rosca";
  const company = "Moldcell";
  const avatar = "https://i.pravatar.cc/150?u=admin@example.com";
  const password = "4285589Ya!@#";

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log("⚠️  Utilizatorul există deja");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = new AdminUser({ email, name, company, avatar, passwordHash });
  await newUser.save();

  console.log("✅ Utilizator creat cu succes:");
  console.log({ email, password });

  mongoose.disconnect();
};

createAdminUser();