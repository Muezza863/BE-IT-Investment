import { verifyToken } from "../helpers/token.js";
import { User } from "../models/index.js";

export const authentication = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next({ message: "You should login", status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.userId = decoded.userId || decoded.id;
    next();
  } catch (error) {
    next({ message: "You should login", status: 401 });
  }
};

export const authorization = (req, res, next) => {
  User.findById(req.params.id)
    .then((data) => {
      if (data && data._id.toString() === req.userId.toString()) {
        next();
      } else {
        next({ message: "You are not allowed", status: 401 });
      }
    })
    .catch(() => {
      next({ message: "You are not allowed", status: 401 });
    });
};
