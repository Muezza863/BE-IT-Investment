import express from "express";
<<<<<<< HEAD
=======
import mongoose from "mongoose";
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
import dotenv from "dotenv";
import cors from "cors";
import passport from "./config/passport.js";
import routes from "./routes/index.js";

// =======================
// 🔧 CONFIG
// =======================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// 🌐 GLOBAL MIDDLEWARE
// =======================
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 Passport (WAJIB untuk Google Auth)
app.use(passport.initialize());


// =======================
// 📦 ROUTES
// =======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running 🚀",
  });
});

// semua route masuk sini
app.use("/api", routes);

// =======================
// ❌ GLOBAL ERROR HANDLER (OPSIONAL TAPI DISARANKAN)
// =======================
app.use((err, req, res, next) => {
  console.error(err);
<<<<<<< HEAD
=======
console.log("Global error handler triggered");
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =======================
// 🚀 START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});