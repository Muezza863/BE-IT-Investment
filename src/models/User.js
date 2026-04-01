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
    name: { type: String },          // For profile display
    firstName: { type: String },     // Optional editable fields
    lastName: { type: String },
    businessName: { type: String },
    role: { type: String },
    avatar: { type: String },        // Optional, for Google profile
    otp: { type: String },           // For Forgot Password
    otpExpired: { type: Date },      // OTP expiry timestamp
  },
  { timestamps: true }
);

// =======================
// 🔐 HASH PASSWORD (Fixed)
// =======================
userSchema.pre("save", async function () {
  try {
    // skip if password not modified
    if (!this.isModified("password")) return;

    console.log("🔥 hashing password...");
    this.password = await hash(this.password);
  } catch (error) {
    throw error; // handled by controller
  }
});

export default mongoose.model("User", userSchema);