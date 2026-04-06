import { Router } from "express";

// =======================
// 📦 CONTROLLERS
// =======================
import {
  createProject,
  getProjectDraft,
  deleteProject,
  getProjects,
  updateDraftProject
} from "../controllers/index.js";

// =======================
// 🔐 AUTH ROUTES
// =======================
import authRoutes from "./authRoutes.js";

// =======================
// 🔐 MIDDLEWARE
// =======================
import {
  authentication,
  authorization
} from "../middlewares/authMiddleware.js";

const router = Router();

// =======================
// 🔐 AUTH ROUTES (FIXED)
// =======================
router.use("/auth", authRoutes); // ✅ FIX DI SINI

// =======================
// 📦 PROJECT ROUTES (PROTECTED)
// =======================

router.get("/projects", authentication, getProjects);

router.post("/projects", authentication, createProject);

router.get("/projects/:id", authentication, getProjectDraft);

router.put(
  "/projects/:id",
  authentication,
  authorization,
  updateDraftProject
);

router.delete(
  "/projects/:id",
  authentication,
  authorization,
  deleteProject
);

// =======================
// 🧪 DEBUG ROUTE
// =======================
router.get("/me", authentication, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;