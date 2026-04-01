import { Router } from "express";
import passport from "../config/passport.js";
import { register, login } from "../controllers/authController.js";

const router = Router();

// =======================
// 🔐 BASIC AUTH (JWT)
// =======================
router.post("/register", register);
router.post("/login", login);

// =======================
// 🔵 GOOGLE AUTH
// =======================

// 🔹 STEP 1: redirect ke Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // ✅ FIX WAJIB
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
      message: "Google login berhasil",
      token,
      user: {
        id: user.id, // ✅ FIX
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