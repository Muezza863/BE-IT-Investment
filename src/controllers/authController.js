import { User } from "../models/index.js";
import { compare } from "../helpers/password.js";
import { generateToken } from "../helpers/token.js";

import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// =======================
// 📧 EMAIL CONFIG
// =======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =======================
// 🔢 GENERATE 4-DIGIT OTP
// =======================
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// =======================
// 🔐 REGISTER
// =======================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = generateToken({ id: user._id, email: user.email, name: user.name });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// 🔐 LOGIN
// =======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const match = await compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = generateToken({ id: user._id, email: user.email, name: user.name });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// 📩 FORGOT PASSWORD (Request OTP)
// =======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "Email not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpired = Date.now() + 5 * 60 * 1000; // 5 menit
    await user.save();

    await transporter.sendMail({
      to: email,
      subject: "Password Reset Verification Code",
      text: `Your OTP code is: ${otp}`,
    });

    res.json({ success: true, message: "OTP code sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// 🔢 VERIFY OTP
// =======================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    if (user.otpExpired < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP code has expired" });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// 🔑 RESET PASSWORD
// =======================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpired = null;
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// 👤 GET PROFILE
// =======================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpired");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// ✏️ UPDATE PROFILE
// =======================
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, businessName, role, avatar, name, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.businessName = businessName || user.businessName;
    user.role = role || user.role;
    user.avatar = avatar || user.avatar;
    user.name = name || user.name;
    user.email = email || user.email; // allow update email if needed

    await user.save();
    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};