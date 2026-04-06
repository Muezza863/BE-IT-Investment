import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
<<<<<<< HEAD
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
=======
    user: process.env.EMAIL || "dummy@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "dummypass",
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
  },
});

export default transporter;
