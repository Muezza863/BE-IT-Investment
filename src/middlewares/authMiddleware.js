import { verifyToken } from "../helpers/token.js";
<<<<<<< HEAD
import { Project } from "../models/index.js";

export const authentication = (req, res, next) => {
=======
import User from "../models/User.js"; // ✅ FIX

// =======================
// 🔐 AUTHENTICATION (JWT)
// =======================
export const authentication = (req, res, next) => {
  console.log("Authentication middleware triggered");
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired token",
    });
  }
};

<<<<<<< HEAD
export const authorization = async (req, res, next) => {
=======
// =======================
// 🔒 AUTHORIZATION (OWNER)
// =======================
export const authorization = async (req, res, next) => {
  console.log("Authorization middleware triggered");
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID parameter is required",
      });
    }

<<<<<<< HEAD
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.userId.toString() !== req.user.id.toString()) {
=======
    const data = await User.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    if (data._id.toString() !== req.user.id.toString()) {
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
      return res.status(403).json({
        success: false,
        message: "Forbidden - You are not allowed",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Authorization error",
    });
  }
};