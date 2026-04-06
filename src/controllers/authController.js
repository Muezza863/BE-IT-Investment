import { User } from "../models/index.js";
import { compare } from "../helpers/password.js";
import { generateToken } from "../helpers/token.js";

const deriveNamaFromEmail = (email) => email?.split("@")[0] || "User";

export const register = async (req, res, next) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        message: "nama, email, dan password wajib diisi",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const user = await User.create({ nama, email, password, role: "user" });
    const token = generateToken({
      userId: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: "Register berhasil",
      token,
      data: {
        id: user._id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        message: "nama, email, dan password wajib diisi",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const admin = await User.create({ nama, email, password, role: "admin" });

    res.status(201).json({
      message: "Admin berhasil dibuat",
      data: {
        id: admin._id,
        nama: admin.nama,
        email: admin.email,
        role: admin.role,
      },
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

    let shouldSave = false;

    if (!user.role) {
      user.role = "user";
      shouldSave = true;
    }

    if (!user.nama) {
      user.nama = deriveNamaFromEmail(user.email);
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }

    const token = generateToken({
      userId: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: "Login berhasil",
      token,
      data: {
        id: user._id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
