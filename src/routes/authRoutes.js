import { Router } from "express";
import { register, login, createAdmin, forgotPassword, verifyOtp, resetPassword, getProfile, updateProfile } from "../controllers/index.js";
import passport from "passport";
import { authentication, authorizeRoles } from "../middlewares/auth.js";
import multer from "multer";


const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Contoh batasan ukuran 5MB
});

// =======================
// 🔐 BASIC AUTH (JWT)
// =======================
router.post("/register", register);
router.post("/login", login);
router.post("/admins", authentication, authorizeRoles("admin"), createAdmin);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
console.log("✅ verify-otp POST route registered");
router.post("/reset-password", authentication, resetPassword);

router.get("/profile", authentication, getProfile);
router.put("/profile", authentication, upload.single("avatar"), updateProfile);

// =======================
// 🔵 GOOGLE AUTH
// =======================

// 🔹 STEP 1: redirect ke Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    accessType: "offline",
    prompt: "select_account",
    session: false,
  })
);

// 🔹 STEP 2: callback dari Google
router.get("/google/callback", (req, res, next) => {
  console.log("📍 Google Callback Route hit");
  
  passport.authenticate("google", { session: false }, (err, data, info) => {
    if (err) {
      console.error("❌ Passport Auth Error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal Auth Error",
        error: err.message,
      });
    }

    if (!data) {
      console.warn("⚠️ No user data returned from Google Strategy. Info:", info);
      return res.status(401).json({
        success: false,
        message: info?.message || "Google authentication failed",
      });
    }

    // Success!
    const { user, token } = data;
    console.log(`✅ Google Auth Success for: ${user.email}`);

    // REDIRECT TO FRONTEND (localhost:5173/auth/google)
    const frontendUrl = `http://localhost:5173/auth/google?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    console.log(`🔗 Redirecting to frontend: ${frontendUrl}`);
    res.redirect(frontendUrl);
  })(req, res, next);
});

// =======================
// ❌ FAILURE & DEBUG
// =======================
router.get("/debug", (req, res) => {
  res.json({
    message: "Auth Debug Info",
    baseUrl: process.env.BASE_URL || "Not Set",
    callbackUrl: "/api/auth/google/callback",
    headers: {
      host: req.headers.host,
      forwardedHost: req.headers["x-forwarded-host"],
      proto: req.headers["x-forwarded-proto"],
    }
  });
});

router.get("/failure", (req, res) => {
  console.log("❌ Auth Failure session/req data:", req.flash ? req.flash("error") : "No flash error");
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

export default router;
