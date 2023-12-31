import express from "express";
import {
    createTask,
    updateTask,
    deleteTask,
    updateAllTasks,
} from "../controllers/taskController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.route("/:boardId/all").put(protect, updateAllTasks);

router.route("/:boardId/:columnId").post(protect, createTask);

router
    .route("/:boardId/:columnId/:taskId")
    .put(protect, updateTask)
    .delete(protect, deleteTask);

export default router;
