import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
<<<<<<< HEAD
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
=======
<<<<<<< HEAD
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
=======
    user: process.env.EMAIL || "dummy@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "dummypass",
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
  },
});

export default transporter;
