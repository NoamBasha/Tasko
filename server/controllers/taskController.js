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
        res.status(401);
        throw new Error(
            "Unauthorized: Could not find board or user is not authorized"
        );
    }

    const column = await prisma.column.findUnique({
        where: { id: columnId, boardId: boardId },
    });

    if (!column) {
        res.status(404);
        throw new Error("Column not found");
    }

    // Create a new task in the specified column
    try {
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
    } catch (error) {
        res.status(500);
        throw new Error("Could not create task");
    }
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
        res.status(401);
        throw new Error(
            "Unauthorized: Could not find board or user is not authorized"
        );
    }

    const column = await prisma.column.findUnique({
        where: { id: columnId, boardId: boardId },
    });

    if (!column) {
        res.status(404);
        throw new Error("Column not found");
    }

    const task = await prisma.task.findUnique({
        where: { id: taskId, columnId: columnId },
    });

    if (!task) {
        res.status(404);
        throw new Error("Task not found");
    }

    try {
        await prisma.task.delete({
            where: { id: taskId },
        });
        res.sendStatus(204);
    } catch (error) {
        res.status(500);
        throw new Error("Could not delete task");
    }
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
        res.status(401);
        throw new Error(
            "Unauthorized: Could not find board or user is not authorized"
        );
    }

    const column = await prisma.column.findUnique({
        where: { id: columnId, boardId: boardId },
    });

    if (!column) {
        res.status(404);
        throw new Error("Column not found");
    }

    const task = await prisma.task.findUnique({
        where: { id: taskId, columnId: columnId },
    });

    if (!task) {
        res.status(404);
        throw new Error("Task not found");
    }

    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                title: title,
                description: description,
                index: +index,
            },
        });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500);
        throw new Error("Could not update task");
    }
});

const updateAllTasks = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;
    const newTasks = req.body;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
    });

    if (!board) {
        res.status(401);
        throw new Error(
            "Unauthorized: Could not find board or user is not authorized"
        );
    }

    for (const task of newTasks) {
        const taskId = task.id;

        try {
            const existingTask = await prisma.task.findUnique({
                where: { id: taskId },
            });

            if (!existingTask) {
                res.status(404);
                throw new Error("Task not found");
            }
        } catch (err) {
            res.status(500);
            throw new Error("Could not find task");
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

    try {
        const transactionResults = await prisma.$transaction(
            prismaPromisesArray
        );
        res.status(200).json(transactionResults);
    } catch (error) {
        res.status(500);
        throw new Error("Could not update tasks");
    }
});

export { createTask, deleteTask, updateTask, updateAllTasks };
