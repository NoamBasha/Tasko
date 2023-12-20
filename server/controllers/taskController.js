import prisma from "../db/prisma.js";

const createTask = async function (req, res) {
    try {
        const userId = req.user.id;
        const boardId = +req.params.boardId;
        const columnId = +req.params.columnId;
        const { title, description } = req.body;

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
                title: title,
                description: description,
                column: {
                    connect: { id: columnId },
                },
            },
        });

        res.status(201).json(createdTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteTask = async function (req, res) {
    try {
        const userId = req.user.id;
        const boardId = +req.params.boardId;
        const columnId = +req.params.columnId;
        const taskId = +req.params.taskId;

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateTask = async function (req, res) {
    try {
        const userId = req.user.id;
        const boardId = +req.params.boardId;
        const columnId = +req.params.columnId;
        const taskId = +req.params.taskId;
        const { title, description } = req.body;

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
            },
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { createTask, deleteTask, updateTask };
