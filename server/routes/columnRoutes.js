import express from "express";
import {
    createColumn,
    deleteColumn,
    updateColumn,
    updateAllColumns,
} from "../controllers/columnController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.route("/:boardId/all").put(protect, updateAllColumns);

router.route("/:boardId").post(protect, createColumn);
router
    .route("/:boardId/:columnId")
    .put(protect, updateColumn)
    .delete(protect, deleteColumn);

export default router;
