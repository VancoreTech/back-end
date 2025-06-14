import express from "express";
import { checkBusinessName, checkEmail, checkStoreUrl, checkUsername, login, register, verifyEmail } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/check-username", checkUsername)
router.post("/check-email", checkEmail)
router.post("/verify-email", verifyEmail)
router.post("/check-business-name", checkBusinessName)
router.post("/check-store-url", checkStoreUrl)
router.post("/register", register)
router.post("/login", login)


export default router