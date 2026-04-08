import { Router } from "express";

// =======================
// 📦 CONTROLLERS
// =======================
import {
  createProject,
  getProjectDraft,
  deleteProject,
  getProjects,
  updateDraftProject,
  getProjectReports,
  chatWithBot,
  getProjectChatHistory,
  sendProjectChatMessage,
  getConsultants,
  getConsultantById,
  createConsultant,
  updateConsultant,
  deleteConsultant,
  getAdminDashboard,
  getDashboard,
  updateInsight,
  resetInsight,
} from "../controllers/index.js";

import authRoutes from "./authRoutes.js";

// =======================
// 🔐 MIDDLEWARE
// =======================
import { authentication, authorizeRoles } from "../middlewares/auth.js";
import { authorization as protectProject } from "../middlewares/authMiddleware.js";

const router = Router();

// AUTH
router.use("/auth", authRoutes);

// CHATBOT GLOBAL
router.post("/chatbot", chatWithBot);

// CONSULTANTS
router.get("/consultants", getConsultants);
router.get("/consultants/:id", getConsultantById);
router.post("/consultants", authentication, authorizeRoles("admin"), createConsultant);
router.put("/consultants/:id", authentication, authorizeRoles("admin"), updateConsultant);
router.delete("/consultants/:id", authentication, authorizeRoles("admin"), deleteConsultant);

// ADMIN DASHBOARD
router.get("/admin/dashboard", authentication, authorizeRoles("admin"), getAdminDashboard);

// 🔥 DASHBOARD FIGMA (REQUIRES AUTH)
router.get("/dashboard", authentication, getDashboard);
router.post("/dashboard/insight", authentication, updateInsight);
router.delete("/dashboard/insight", authentication, resetInsight);

// PROJECT
router.get("/projects", authentication, getProjects);
router.post("/projects", authentication, authorizeRoles("user"), createProject);
router.get("/projects/:id", authentication, getProjectDraft);
router.get("/projects/:id/reports", authentication, protectProject, getProjectReports);
router.put("/projects/:id", authentication, protectProject, updateDraftProject);
router.delete("/projects/:id", authentication, protectProject, deleteProject);

// PROJECT CHAT
router.get("/projects/:id/chatbot", authentication, protectProject, getProjectChatHistory);
router.post("/projects/:id/chatbot", authentication, protectProject, sendProjectChatMessage);

export default router;