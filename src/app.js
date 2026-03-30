import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import "./services/db.js";
import projectRoutes from "./routes/index.js";



const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware tambahan untuk meminimalisir error dari req Postman (form-data)
app.use(upload.none());

app.use("/api", projectRoutes);


app.get("/test", (req, res) => {
    res.status(200).json({
        message: "Backend is running",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});