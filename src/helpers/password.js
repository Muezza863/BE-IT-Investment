import bcrypt from "bcryptjs";

<<<<<<< HEAD
export const hash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const compare = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
=======
export const hash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPas = bcrypt.hashSync(password, salt);
  return hashedPas;
};

export const compare = (password, hashedPassword) => {
  const isMatch = bcrypt.compareSync(password, hashedPassword);
  return isMatch;
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
};
