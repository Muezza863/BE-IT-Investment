import { Router } from "express";
import {
  createProject,
  getProjectDraft,
  deleteProject,
  getProjects,
  updateDraftProject,
  chatWithBot,
  getConsultants,
  getConsultantById,
  createConsultant,
  updateConsultant,
  deleteConsultant,
  getAdminDashboard,
} from "../controllers/index.js";
import authRoutes from "./authRoutes.js";
import { authentication, authorizeRoles } from "../middlewares/auth.js";

const router = Router();

router.use("/auth", authRoutes);

router.post("/chatbot", chatWithBot);

router.get("/consultants", getConsultants);
router.get("/consultants/:id", getConsultantById);
router.post("/consultants", authentication, authorizeRoles("admin"), createConsultant);
router.put("/consultants/:id", authentication, authorizeRoles("admin"), updateConsultant);
router.delete("/consultants/:id", authentication, authorizeRoles("admin"), deleteConsultant);

router.get("/admin/dashboard", authentication, authorizeRoles("admin"), getAdminDashboard);

router.get("/projects", getProjects);
router.post("/projects", authentication, authorizeRoles("user"), createProject);
router.get("/projects/:id", getProjectDraft);
router.put("/projects/:id", updateDraftProject);
router.delete("/projects/:id", deleteProject);

export default router;
