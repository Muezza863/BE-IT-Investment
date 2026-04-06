import mongoose from "mongoose";
import { hash } from "../helpers/password.js";

const userSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
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
<<<<<<< HEAD
=======
=======
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
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
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    avatar: {
      type: String,
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpiry: {
      type: Date,
    },
<<<<<<< HEAD
=======
=======
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
  },
  { timestamps: true }
);

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
userSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;
    this.password = await hash(this.password);
  } catch (error) {
    throw error;
  }
});

export default mongoose.model("User", userSchema);
<<<<<<< HEAD
=======
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
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
