import express from "express";
import { createNewUser, getMe } from "../controllers/userController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.post("/register", createNewUser);
router.get("/getMe", protect, getMe);

export default router;
