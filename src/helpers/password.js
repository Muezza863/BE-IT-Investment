import bcrypt from "bcryptjs";

export const hash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const compare = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
