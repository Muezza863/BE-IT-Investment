import { Router } from "express";
import passport from "../config/passport.js";
import authMiddleware from "../middleware/auth.js";

import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";

const router = Router();

// =======================
// 🔐 AUTH (JWT)
// =======================
router.post("/register", register);
router.post("/login", login);

// =======================
// 🔵 GOOGLE AUTH
// =======================
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/failure",
  }),
  (req, res) => {
    const { user, token } = req.user;

    res.json({
      success: true,
      message: "Google login berhasil",
      token,
      user,
    });
  }
);

// =======================
// 🔐 FORGOT PASSWORD FLOW
// =======================

// 📩 STEP 1: Input Email (Confirm Email Page)
router.post("/forgot-password", forgotPassword);

// 🔢 STEP 2: Confirm OTP Page
router.post("/verify-otp", verifyOtp);

// 🔑 STEP 3: Reset Password Page
router.post("/reset-password", resetPassword);

// =======================
// 👤 EDIT PROFILE PAGE
// =======================

// 📥 Load data profile
router.get("/profile", authMiddleware, getProfile);

// 💾 Save changes
router.put("/profile", authMiddleware, updateProfile);

// =======================
// ❌ FAILURE
// =======================
router.get("/failure", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

export default router;