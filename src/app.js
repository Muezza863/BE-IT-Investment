import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import "./services/index.js";
import projectRoutes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware tambahan untuk meminimalisir error dari req Postman (form-data)
app.use(upload.none());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", projectRoutes);

app.use(errorHandler);

app.get("/consul", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "consul.html"));
});

app.get("/test", (req, res) => {
    res.status(200).json({
        message: "Backend is running",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
