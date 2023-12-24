import express from "express";
import { login, refresh, logout } from "../controllers/authController.js";
import protect from "../middleware/protect.js";
import loginLimiter from "../middleware/loginLimiter.js";

const router = express.Router();

//TODO add login limiter here?
router.post("/", login);
router.get("/refresh", refresh);
router.post("/logout", logout);

export default router;
