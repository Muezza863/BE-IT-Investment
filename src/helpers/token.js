import jwt from "jsonwebtoken";

// 
// 🔐 GENERATE ACCESS TOKEN
//
export const generateToken = (payload) => {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
  console.log("nx");
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
  try {
    return jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d", // bisa ubah: 1h, 7d, dll
        issuer: "your-app", // optional tapi recommended
      }
    );
  } catch (error) {
    throw new Error("Error generating token");
  }
};

// =======================
// 🔁 GENERATE REFRESH TOKEN 
// =======================
export const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(
      {
        id: payload.id,
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: "your-app",
      }
    );
  } catch (error) {
    throw new Error("Error generating refresh token");
  }
};

// =======================
// 🔍 VERIFY ACCESS TOKEN
// =======================
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// =======================
// 🔍 VERIFY REFRESH TOKEN
// =======================
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};