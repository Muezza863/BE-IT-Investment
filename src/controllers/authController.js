import { User } from "../models/index.js";
import { compare } from "../helpers/password.js";
import { generateToken } from "../helpers/token.js";
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
import transporter from "../helpers/mailer.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, businessName, role } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

<<<<<<< HEAD
=======
=======

// =======================
// 🔐 REGISTER
// =======================
export const register = async (req, res) => {
  console.log("Register controller triggered");
  try {
    const { name, email, password } = req.body;

    // 🔍 cek user sudah ada
    console.log("Checking if user already exists with email:", email);
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    // 🆕 create user
    console.log("Creating new user with email:", email);
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    const user = await User.create({
      name,
      email,
      password,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
      businessName,
      role,
    });

<<<<<<< HEAD
=======
=======
    });
console.log("sd");
    // 🔑 generate token (sinkron dengan middleware)
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
    });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe

    res.status(201).json({
      success: true,
      message: "Registration successful",
<<<<<<< HEAD
=======
=======
console.log("rx");
    res.status(201).json({
      success: true,
      message: "Register berhasil",
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
        businessName: user.businessName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

<<<<<<< HEAD
=======
=======
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  
};

// =======================
// 🔐 LOGIN
// =======================
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const match = await compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

<<<<<<< HEAD
=======
=======
    // 🔍 cari user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // 🔐 cek password
    const match = compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // 🔑 generate token (HARUS sama dengan Google Auth)
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
    });

    res.json({
      success: true,
<<<<<<< HEAD
      message: "Login successful",
=======
<<<<<<< HEAD
      message: "Login successful",
=======
      message: "Login berhasil",
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
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
<<<<<<< HEAD
=======
=======
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
