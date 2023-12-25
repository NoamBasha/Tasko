import prisma from "../db/prisma.js";
import asyncHandler from "express-async-handler";

const createTask = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;
    const columnId = req.params.columnId;
    const { title, description, index, id } = req.body;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
    });

    if (!board) {
        return res.status(401).json({
            message:
                "Unauthorized: Could not find board or user is not authorized",
        });
    }

    const column = await prisma.column.findUnique({
        where: { id: columnId, boardId: boardId },
    });

    if (!column) {
        return res.status(404).json({ message: "Column not found" });
    }

    // Create a new task in the specified column
    const createdTask = await prisma.task.create({
        data: {
            id: id,
            title: title,
            description: description,
            index: +index,
            column: {
                connect: { id: columnId },
            },
        },
    });

    res.status(201).json(createdTask);
});

const deleteTask = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;
    const columnId = req.params.columnId;
    const taskId = req.params.taskId;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
    });

    if (!board) {
        return res.status(401).json({
            message:
                "Unauthorized: Could not find board or user is not authorized",
        });
    }

    const column = await prisma.column.findUnique({
        where: { id: columnId, boardId: boardId },
    });

    if (!column) {
        return res.status(404).json({ message: "Column not found" });
    }

    const task = await prisma.task.findUnique({
        where: { id: taskId, columnId: columnId },
    });

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({
        where: { id: taskId },
    });

    res.sendStatus(204);
});

const updateTask = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;
    const columnId = req.params.columnId;
    const taskId = req.params.taskId;
    const { title, description, index } = req.body;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
    });

    if (!board) {
        return res.status(401).json({
            message:
                "Unauthorized: Could not find board or user is not authorized",
        });
    }

    const column = await prisma.column.findUnique({
        where: { id: columnId, boardId: boardId },
    });

    if (!column) {
        return res.status(404).json({ message: "Column not found" });
    }

    const task = await prisma.task.findUnique({
        where: { id: taskId, columnId: columnId },
    });

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
            title: title,
            description: description,
            index: +index,
        },
    });

    res.status(200).json(updatedTask);
});

const updateAllTasks = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;
    const newTasks = req.body;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
    });

    if (!board) {
        return res.status(401).json({
            message: "Could not find board or user is not authorized",
        });
    }

    for (const task of newTasks) {
        const taskId = task.id;

        try {
            const existingTask = await prisma.task.findUnique({
                where: { id: taskId },
            });

            if (!existingTask) {
                return res.status(404).json({ message: "Could not find task" });
            }
        } catch (err) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    const prismaPromisesArray = newTasks.map((task) => {
        const taskId = task.id;

        return prisma.task.update({
            where: { id: taskId },
            data: {
                index: +task.index,
                columnId: task.columnId,
            },
        });
    });

    // Use a Prisma transaction to update all columns in the array
    const transactionResults = await prisma.$transaction(prismaPromisesArray);

    res.status(200).json(transactionResults);
});

export { createTask, deleteTask, updateTask, updateAllTasks };
