import User from "../models/User.js";
import bcrypt from "bcryptjs";
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

    res.status(201).json({ token });
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

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = generateToken({ userId: user._id });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};