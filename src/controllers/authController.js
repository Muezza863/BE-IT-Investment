import User from "../models/User.js";
import { compare } from "../helpers/password.js";
import { generateToken } from "../helpers/token.js";

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const user = await User.create({ email, password });
    const token = generateToken({ userId: user._id });

    res.status(201).json({ 
      message: "Register berhasil", 
      token 
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const match = compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = generateToken({ userId: user._id });
    res.json({ 
      message: "Login berhasil",
      token 
    });
  } catch (err) {
    next(err);
  }
};
