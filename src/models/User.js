import mongoose from "mongoose";
import { hash } from "../helpers/password.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
  },
  { timestamps: true }
);

// =======================
// 🔐 HASH PASSWORD (FIXED)
// =======================
userSchema.pre("save", async function () {
  try {
    // kalau password tidak diubah → skip
    if (!this.isModified("password")) return;

    console.log("🔥 hashing password...");

    this.password = await hash(this.password);

  } catch (error) {
    throw error; // biar ke-handle oleh controller
  }
});

export default mongoose.model("User", userSchema);