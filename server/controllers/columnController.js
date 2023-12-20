import prisma from "../db/prisma.js";

const createColumn = async function (req, res) {
    try {
        const userId = req.user.id;
        const boardId = +req.params.boardId;
        const { title, index } = req.body;

        console.log(userId, boardId, title, index);

        const board = await prisma.board.findUnique({
            where: { id: boardId, userId: userId },
        });

        if (!board) {
            return res
                .status(403)
                .json({ message: "Board not found or user not authorized" });
        }

        const newColumn = await prisma.column.create({
            data: {
                title: title,
                index: +index,
                board: {
                    connect: { id: boardId },
                },
            },
        });

        if (!newColumn) {
            return res.status(400).json({ message: "Could not create column" });
        }

        res.status(201).json(newColumn);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteColumn = async function (req, res) {
    try {
        const userId = req.user.id;
        const columnId = +req.params.columnId;
        const boardId = +req.params.boardId;

        const board = await prisma.board.findUnique({
            where: {
                id: boardId,
                userId: userId,
            },
        });

        if (!board) {
            return res
                .status(404)
                .json({ message: "Board not found or user not authorized" });
        }

        const column = await prisma.column.findUnique({
            where: {
                id: columnId,
                boardId: boardId,
            },
        });

        if (!column) {
            return res
                .status(404)
                .json({ message: "Column not found or user not authorized" });
        }

        await prisma.task.deleteMany({
            where: {
                columnId: columnId,
            },
        });

        await prisma.column.delete({
            where: {
                id: columnId,
            },
        });

        console.log(columnId);

        //TODO for all deletings return 204 and use the existing id in the frontend
        res.status(200).json({ id: columnId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateColumn = async function (req, res) {
    try {
        const userId = req.user.id;
        const columnId = +req.params.columnId;
        const boardId = +req.params.boardId;
        const { title, index } = req.body;

        const board = await prisma.board.findUnique({
            where: { id: boardId, userId: userId },
        });

        if (!board) {
            return res.status(401).json({
                message: "Could not find board or user is not authorized",
            });
        }

        const column = await prisma.column.findUnique({
            where: { id: columnId, boardId: boardId },
        });

        if (!column) {
            return res.status(404).json({ message: "Could not gind column" });
        }

        const updatedColumn = await prisma.column.update({
            where: { id: columnId },
            data: {
                title: title,
                index: +index,
            },
        });

        res.status(200).json(updatedColumn);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { createColumn, deleteColumn, updateColumn };
