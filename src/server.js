import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import passport from "passport";
import authRoutes from "./routes/auth.routes.js";
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
