import { decodedToken } from "../helpers/token.js";
import Tugas2 from "../models/User.js"; // pastikan ini memang model yang benar

export const authentication = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = decodedToken(token);

    req.userId = decoded.id;
    next();
  } catch (error) {
    next({ message: "You should login", status: 401 });
  }
};

export const authorization = (req, res, next) => {
  Tugas2.findById(req.params.id)
    .then((data) => {
      if (data.userId == req.userId) {
        next();
      } else {
        next({ message: "You are not allowed", status: 401 });
      }
    })
    .catch(() => {
      next({ message: "You are not allowed", status: 401 });
    });
};