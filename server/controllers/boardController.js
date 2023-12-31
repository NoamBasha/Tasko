import prisma from "../db/prisma.js";
import asyncHandler from "express-async-handler";

const getBoards = asyncHandler(async function (req, res) {
    const userId = req.user.id;

    const boardsNames = await prisma.board.findMany({
        where: { userId: userId },
    });

    res.status(200).json(boardsNames);
});

const getBoard = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;

    const board = await prisma.board.findUnique({
        where: { userId: userId, id: boardId },
        include: {
            columns: {
                include: { tasks: true },
            },
        },
    });

    if (!board) {
        res.status(404);
        throw new Error("Board not found");
    }

    res.status(200).json(board);
});

const createBoard = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const { id, name, index } = req.body;

    try {
        const createdBoard = await prisma.board.create({
            data: {
                id: id,
                name: name,
                index: +index,
                user: {
                    connect: { id: userId },
                },
            },
        });
        res.status(201).json(createdBoard);
    } catch (error) {
        res.status(500);
        throw new Error("Could not create board");
    }
});

const deleteBoard = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
        include: {
            columns: {
                include: {
                    tasks: true,
                },
            },
        },
    });

    if (!board) {
        res.status(404);
        throw new Error("Board not found");
    }

    const columnIds = board.columns.map((column) => column.id);
    try {
        await prisma.$transaction([
            prisma.task.deleteMany({
                where: {
                    columnId: {
                        in: columnIds,
                    },
                },
            }),
            prisma.column.deleteMany({
                where: {
                    boardId: boardId,
                },
            }),
            prisma.board.delete({
                where: { id: boardId },
            }),
        ]);
    } catch (error) {
        res.status(500);
        throw new Error("Could not delete board");
    }

    res.sendStatus(204);
});

const updateBoard = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const boardId = req.params.boardId;
    const { name, index } = req.body;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
    });

    if (!board) {
        res.status(404);
        throw new Error("Board not found");
    }

    try {
        const updatedBoard = await prisma.board.update({
            where: { id: boardId },
            data: {
                name: name,
                index: index,
            },
        });
        res.status(200).json(updatedBoard);
    } catch (error) {
        res.status(404);
        throw new Error("Could not update board");
    }
});

const updateAllBoards = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const newBoards = req.body;

    const databaseBoards = [];

    for (const board of newBoards) {
        const boardId = board.id;

        try {
            const existingBoard = await prisma.board.findUnique({
                where: { id: boardId, userId: userId },
            });

            if (!existingBoard) {
                res.status(500);
                throw new Error("Could not update boards");
            }

            databaseBoards.push(board);
        } catch (err) {
            // res.status(500);
            // throw new Error("Could not update columns");
        }
    }

    const prismaPromisesArray = databaseBoards.map((board) => {
        const boardId = board.id;

        return prisma.board.update({
            where: { id: boardId },
            data: {
                index: +board.index,
            },
        });
    });

    // Use a Prisma transaction to update all boards in the array
    try {
        const transactionResults = await prisma.$transaction(
            prismaPromisesArray
        );
        res.status(200).json(transactionResults);
    } catch (error) {
        res.status(500);
        throw new Error("Could not update boards");
    }
});

export {
    getBoards,
    getBoard,
    createBoard,
    deleteBoard,
    updateBoard,
    updateAllBoards,
};
