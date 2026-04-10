import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./config/passport.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

console.log("✅ Base imports loaded");
console.log("✅ Routes imported:", typeof routes);
import "./services/index.js";
import errorHandler from "./middlewares/errorHandler.js";

console.log("✅ All imports loaded successfully");

// =======================
// 🔧 CONFIG
// =======================
dotenv.config();
console.log("📂 Environment variables loaded from .env");

const app = express();
app.set("trust proxy", true); // CRITICAL for ngrok/proxy support
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer();

// =======================
// 🌐 GLOBAL MIDDLEWARE
// =======================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8080",
  "http://localhost:7510",
  "http://127.0.0.1:7510",
  "http://localhost:50185",
  "http://127.0.0.1:50185",
  "http://localhost:63255",
  "http://127.0.0.1:63255",
];

// TEMPORARILY DISABLE CORS AND OTHER MIDDLEWARE
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (
//       origin.endsWith(".ngrok-free.app") ||
//       origin.endsWith(".ngrok-free.dev") ||
//       origin.endsWith(".ngrok.io")
//     ) {
//       return callback(null, true);
//     }
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error(`CORS: Origin '${origin}' tidak diizinkan`));
//   },
//   credentials: true,
// }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, "..", "FE-Test")));

// PASSPORT
app.use(passport.initialize());

// REQUEST LOGGING
app.use((req, res, next) => {
  console.log(`📍 REQUEST: ${req.method} ${req.originalUrl} (Path: ${req.path})`);
  next();
});

// =======================
// 📦 ROUTES
// =======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running 🚀",
  });
});

// Route untuk serve login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "FE-Test", "login.html"));
});

// Route untuk serve register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "FE-Test", "register.html"));
});

app.get("/consul", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "FE-Test", "consul.html"));
});

app.get("/test", (req, res) => {
    res.status(200).json({
        message: "Backend is running",
    });
});

// AUTH ROUTES (DIRECT MOUNTING TO PREVENT 404)
app.use("/api/auth", authRoutes);

app.use("/api", routes);

// 🧪 TEST ROUTE
app.get("/api/test-direct", (req, res) => {
  res.json({ success: true, message: "Direct test route works!" });
});

// Temporary POST test route
app.post("/api/test-post", (req, res) => {
  console.log("POST body received:", req.body);
  res.json({ success: true, message: "POST works!", received: req.body });
});

// =======================
// ❌ GLOBAL ERROR HANDLER (TEMPORARILY DISABLED)
// =======================
// app.use(errorHandler);

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
