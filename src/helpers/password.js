import bcrypt from "bcryptjs";

export const hash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPas = bcrypt.hashSync(password, salt);
  return hashedPas;
};

export const compare = (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false;
  }

  const isMatch = bcrypt.compareSync(password, hashedPassword);
  return isMatch;
};
