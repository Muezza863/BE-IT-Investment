import { Router } from "express";
import { register, login, createAdmin } from "../controllers/index.js";
import { authentication, authorizeRoles } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admins", authentication, authorizeRoles("admin"), createAdmin);

export default router;
