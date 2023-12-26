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
        res.status(404);
        throw new Error("Board not found");
    }

    try {
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
            res.status(500);
            throw new Error("Could not create column");
        }

        res.status(201).json(newColumn);
    } catch (error) {
        res.status(500);
        throw new Error("Could not create column");
    }
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
        res.status(404);
        throw new Error("Board not found");
    }

    const column = await prisma.column.findUnique({
        where: {
            id: columnId,
            boardId: boardId,
        },
    });

    if (!column) {
        res.status(404);
        throw new Error("Column not found");
    }

    try {
        await prisma.$transaction([
            // Delete tasks associated with the column
            prisma.task.deleteMany({
                where: { columnId: columnId },
            }),

            // Delete the column
            prisma.column.delete({
                where: { id: columnId },
            }),
        ]);
    } catch (error) {
        res.status(500);
        throw new Error("Could not delete column");
    }

    res.sendStatus(204);
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
        res.status(404);
        throw new Error("Board not found");
    }

    const column = await prisma.column.findUnique({
        where: { id: columnId, boardId: boardId },
    });

    if (!column) {
        res.status(404);
        throw new Error("Column not found");
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
        res.status(401);
        throw new Error("Board not found");
    }

    const databaseColumns = [];

    for (const column of newColumns) {
        const columnId = column.id;

        try {
            const existingColumn = await prisma.column.findUnique({
                where: { id: columnId, boardId: boardId },
            });

            if (!existingColumn) {
                res.status(500);
                throw new Error("Could not update columns");
            }

            databaseColumns.push(column);
        } catch (err) {
            // res.status(500);
            // throw new Error("Could not update columns");
        }
    }

    const prismaPromisesArray = databaseColumns.map((column) => {
        const columnId = column.id;

        return prisma.column.update({
            where: { id: columnId },
            data: {
                index: +column.index,
            },
        });
    });

    // Use a Prisma transaction to update all columns in the array
    try {
        const transactionResults = await prisma.$transaction(
            prismaPromisesArray
        );
        res.status(200).json(transactionResults);
    } catch (error) {
        res.status(500);
        throw new Error("Could not update columns");
    }
});

export { createColumn, deleteColumn, updateColumn, updateAllColumns };
