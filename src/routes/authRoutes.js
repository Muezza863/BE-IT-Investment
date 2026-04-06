import { Router } from "express";
import passport from "../config/passport.js";
<<<<<<< HEAD
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

router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", authentication, resetPassword);

router.get("/profile", authentication, getProfile);
router.put("/profile", authentication, updateProfile);

=======
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
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
<<<<<<< HEAD
    session: false,
  })
);

=======
    session: false, // ✅ FIX WAJIB
  })
);

// 🔹 STEP 2: callback dari Google
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
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
<<<<<<< HEAD
        id: user.id,
=======
        id: user.id, // ✅ FIX
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }
);

<<<<<<< HEAD
=======
// =======================
// ❌ FAILURE
// =======================
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
router.get("/failure", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
