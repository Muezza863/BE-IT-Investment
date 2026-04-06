import { User } from "../models/index.js";
import { compare } from "../helpers/password.js";
import { generateToken } from "../helpers/token.js";
import transporter from "../helpers/mailer.js";

const deriveNameFromEmail = (email) => email?.split("@")[0] || "User";

// =======================
// 🔐 REGISTER
// =======================
export const register = async (req, res, next) => {
  try {
    const { name, nama, email, password, confirmPassword, businessName, role } = req.body;
    
    // Support both name and nama for backward compatibility
    const finalName = name || nama;

    if (!finalName || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const user = await User.create({
      name: finalName,
      email,
      password,
      businessName,
      role: role || "user",
    });

    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        role: user.role,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        role: user.role,
      }
    });
  } catch (error) {
    if (next) return next(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { name, nama, email, password } = req.body;
    const finalName = name || nama;

    if (!finalName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const admin = await User.create({ name: finalName, email, password, role: "admin" });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    if (next) return next(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// 🔐 LOGIN
// =======================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const match = compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    let shouldSave = false;

    if (!user.role) {
      user.role = "user";
      shouldSave = true;
    }

    if (!user.name) {
      user.name = deriveNameFromEmail(user.email);
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }

    const token = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        role: user.role,
      },
    });
  } catch (error) {
    if (next) return next(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email is not registered" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset OTP - InvesTECHy",
      html: `
        <h3>Reset Your Password</h3>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 8px;">${otp}</h1>
        <p>This code is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    });

    res.json({ success: true, message: "OTP code has been sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const resetToken = generateToken({ id: user._id, email: user.email, name: user.name });

    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "OTP verified", resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetOtp -resetOtpExpiry"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, businessName, role, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (businessName !== undefined) user.businessName = businessName;
    if (role !== undefined) user.role = role;
    if (avatar !== undefined) user.avatar = avatar;

    if (firstName || lastName) {
      user.name = `${firstName ?? user.firstName ?? ""} ${lastName ?? user.lastName ?? ""}`.trim();
    }

    await user.save();

    const updated = await User.findById(req.user.id).select(
      "-password -resetOtp -resetOtpExpiry"
    );

    res.json({ success: true, message: "Profile updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
