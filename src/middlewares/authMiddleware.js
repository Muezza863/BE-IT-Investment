import { verifyToken } from "../helpers/token.js";
import { User } from "../models/index.js"; // Updated to match your main model import

// =======================
// 🔐 AUTHENTICATION (JWT)
// Middleware for protecting routes like /profile, /update-profile
// =======================
export const authentication = (req, res, next) => {
  console.log("Authentication middleware triggered");

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Attach user info to request object
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

// =======================
// 🔒 AUTHORIZATION (OWNER)
// Optional middleware to allow users to modify only their own data
// =======================
export const authorization = async (req, res, next) => {
  console.log("Authorization middleware triggered");

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID parameter is required",
      });
    }

    const userData = await User.findById(id);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userData._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not allowed to perform this action",
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