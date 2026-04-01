import { User } from "../models/index.js";
import { compare } from "../helpers/password.js";
import { generateToken } from "../helpers/token.js";

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
    const user = await User.create({
      name,
      email,
      password,
    });
console.log("sd");
    // 🔑 generate token (sinkron dengan middleware)
    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
    });
console.log("rx");
    res.status(201).json({
      success: true,
      message: "Register berhasil",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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
    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
    });

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};