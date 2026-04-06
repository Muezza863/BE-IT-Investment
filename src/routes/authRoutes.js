import { Router } from "express";
import passport from "../config/passport.js";
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { authentication } from "../middlewares/authMiddleware.js";

const router = Router();

// =======================
// 🔐 BASIC AUTH (JWT)
// =======================
router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", authentication, resetPassword);

router.get("/profile", authentication, getProfile);
router.put("/profile", authentication, updateProfile);

// =======================
// 🔵 GOOGLE AUTH
// =======================

// 🔹 STEP 1: redirect ke Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// 🔹 STEP 2: callback dari Google
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
      message: "Google login successful",
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }
);

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
