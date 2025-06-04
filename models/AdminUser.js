import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  company: { type: String, required: true },
  avatar: { type: String },

  roles: {
    type: [String],
    default: ["Admin"], 
  },
});

// Metodă pentru validare parolă
AdminUserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("AdminUser", AdminUserSchema);