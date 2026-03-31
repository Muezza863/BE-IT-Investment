import { Router } from "express";
import { createProject } from "../controllers/index.js";
import authRoutes from "./authRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.post("/projects", createProject);

export default router;