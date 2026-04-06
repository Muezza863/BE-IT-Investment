import mongoose from "mongoose";
import { hash } from "../helpers/password.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    businessName: {
      type: String,
    },
    role: {
      type: String,
    },
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
    avatar: {
      type: String,
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;
    this.password = await hash(this.password);
  } catch (error) {
    throw error;
  }
});

export default mongoose.model("User", userSchema);
