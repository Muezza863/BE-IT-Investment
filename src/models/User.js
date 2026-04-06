import mongoose from "mongoose";
import { hash } from "../helpers/password.js";

const userSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
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
=======
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
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
<<<<<<< HEAD
    avatar: {
      type: String,
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpiry: {
      type: Date,
    },
=======
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
  },
  { timestamps: true }
);

<<<<<<< HEAD
userSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;
    this.password = await hash(this.password);
  } catch (error) {
    throw error;
  }
});

export default mongoose.model("User", userSchema);
=======
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
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
