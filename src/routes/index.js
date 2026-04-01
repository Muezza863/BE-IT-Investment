import { Router } from "express";
import { createProject, getProjectDraft, deleteProject, getProjects, updateDraftProject } from "../controllers/index.js";
import authRoutes from "./authRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.get("/projects", getProjects);
router.post("/projects", createProject);
router.get("/projects/:id", getProjectDraft);
router.put("/projects/:id", updateDraftProject);
router.delete("/projects/:id", deleteProject);

export default router;