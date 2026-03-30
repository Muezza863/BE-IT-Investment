import mongoose from "mongoose";
import { setServers } from "node:dns/promises";
import dotenv from "dotenv";

dotenv.config();

setServers(["1.1.1.1", "8.8.8.8"]);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected!"))
  .catch((err) =>
    console.error("MongoDB connection error:", err.message)
  );

export default mongoose;