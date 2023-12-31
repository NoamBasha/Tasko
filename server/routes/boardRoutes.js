import express from "express";
import {
    getBoards,
    getBoard,
    createBoard,
    deleteBoard,
    updateBoard,
    updateAllBoards,
} from "../controllers/boardController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.route("/all").put(protect, updateAllBoards);

router.route("/").get(protect, getBoards).post(protect, createBoard);
router
    .route("/:boardId")
    .get(protect, getBoard)
    .put(protect, updateBoard)
    .delete(protect, deleteBoard);

export default router;
