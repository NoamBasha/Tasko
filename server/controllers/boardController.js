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
        throw new Error("Board not found or does not belong to the user");
    }

    res.status(200).json(board);
});

const createBoard = asyncHandler(async function (req, res) {
    const userId = req.user.id;
    const { id, name } = req.body;

    try {
        const createdBoard = await prisma.board.create({
            data: {
                id: id,
                name: name,
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
        throw new Error("Board not found or does not belong to the user");
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
    const { name } = req.body;

    const board = await prisma.board.findUnique({
        where: { id: boardId, userId: userId },
    });

    if (!board) {
        res.status(404);
        throw new Error("Board not found or does not belong to the user");
    }

    try {
        const updatedBoard = await prisma.board.update({
            where: { id: boardId },
            data: {
                name: name,
            },
        });
        res.status(200).json(updatedBoard);
    } catch (error) {
        res.status(404);
        throw new Error("Could not update board");
    }
});

export { getBoards, getBoard, createBoard, deleteBoard, updateBoard };
