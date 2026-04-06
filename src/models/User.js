import mongoose from "mongoose";
import { hash } from "../helpers/password.js";

const userSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    googleId: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = hash(this.password);
});

export default mongoose.model("User", userSchema);
