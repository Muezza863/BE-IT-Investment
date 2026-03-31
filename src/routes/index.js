import { Router } from "express";
import { createProject } from "../controllers/projectController.js";
import authRoutes from "./authRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.post("/projects", createProject);

export default router;

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "./config/passport.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

// Setup CORS & JSON
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// Routes
app.get("/", (req, res) => res.json({ message: "API running" }));

// Google OAuth
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
  (req, res) => {
    res.json({
      success: true,
      token: req.user.token,
      user: req.user.user
    });
  }
);

app.get("/auth/failure", (req, res) => {
  res.status(401).json({ success: false, message: "Authentication failed" });
});

// Auth middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Protected route example
app.get("/dashboard", authenticateJWT, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}` });
});

// Start Server
app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port", process.env.PORT)
);