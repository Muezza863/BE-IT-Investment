import { Router } from "express";
import passport from "../config/passport.js";
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
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

<<<<<<< HEAD
=======
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
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    session: false,
  })
);

<<<<<<< HEAD
=======
=======
    session: false, // ✅ FIX WAJIB
  })
);

// 🔹 STEP 2: callback dari Google
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
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
<<<<<<< HEAD
        id: user.id,
=======
        id: user.id, // ✅ FIX
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }
);

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
// =======================
// ❌ FAILURE
// =======================
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
router.get("/failure", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

<<<<<<< HEAD
export default router;
=======
<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
