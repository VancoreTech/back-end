import express from "express";
import { addBusinessInfo, checkBusinessName, checkEmail, checkStoreUrl, checkUsername, createUser, login, register, verifyEmail } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/check-email", checkEmail)
router.post("/verify-email", verifyEmail)
router.post("/create-user", createUser)
router.post("/add-business-info", addBusinessInfo)
router.post("/register", register)
router.post("/login", login)
router.get("/user/:userId", getUser)


export default router