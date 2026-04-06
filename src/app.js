import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./config/passport.js";
import routes from "./routes/index.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import "./services/index.js";
import errorHandler from "./middlewares/errorHandler.js";

// =======================
// 🔧 CONFIG
// =======================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer();

// =======================
// 🌐 GLOBAL MIDDLEWARE
// =======================
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware tambahan untuk meminimalisir error dari req Postman (form-data)
app.use(upload.none());
app.use(express.static(path.join(__dirname, "..", "public")));

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

app.get("/consul", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "consul.html"));
});

app.get("/test", (req, res) => {
    res.status(200).json({
        message: "Backend is running",
    });
});

// semua route masuk sini
app.use("/api", routes);

// =======================
// ❌ GLOBAL ERROR HANDLER
// =======================
app.use(errorHandler);

app.use((err, req, res, next) => {
  console.error("Global error handler triggered:", err);
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
