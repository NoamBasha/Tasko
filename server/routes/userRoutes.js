import express from "express";
import { login, register, getMe } from "../controllers/userController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/getMe", protect, getMe);

export default router;
