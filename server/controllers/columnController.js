import prisma from "../db/prisma.js";
import asyncHandler from "express-async-handler";

const createColumn = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;
    const { title, index, id } = req.body;

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
            id: id,
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
});

const deleteColumn = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const columnId = req.params.columnId;
    const boardId = req.params.boardId;

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

    //TODO for all deletings return 204 and use the existing id in the frontend
    res.status(200).json({ id: columnId });
});

const updateColumn = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const columnId = req.params.columnId;
    const boardId = req.params.boardId;
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
});

const updateAllColumns = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;
    const newColumns = req.body;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
    });

    if (!board) {
        return res.status(401).json({
            message: "Could not find board or user is not authorized",
        });
    }

    for (const column of newColumns) {
        const columnId = column.id;

        try {
            const existingColumn = await prisma.column.findUnique({
                where: { id: columnId, boardId: boardId },
            });

            if (!existingColumn) {
                return res
                    .status(404)
                    .json({ message: "Could not find column" });
            }
        } catch (err) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    const prismaPromisesArray = newColumns.map((column) => {
        const columnId = column.id;

        return prisma.column.update({
            where: { id: columnId },
            data: {
                index: +column.index,
            },
        });
    });

    // Use a Prisma transaction to update all columns in the array
    const transactionResults = await prisma.$transaction(prismaPromisesArray);
    res.status(200).json(transactionResults);
});

export { createColumn, deleteColumn, updateColumn, updateAllColumns };
