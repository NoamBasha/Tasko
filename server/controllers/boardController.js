import prisma from "../db/prisma.js";

const getBoards = async function (req, res) {
    try {
        const userId = req.user.id;

        const boardsNames = await prisma.board.findMany({
            where: { userId: userId },
        });

        res.status(200).json(boardsNames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getBoard = async function (req, res) {
    try {
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
            return res.status(404).json({
                message: "Board not found or does not belong to the user",
            });
        }

        res.status(200).json(board);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const createBoard = async function (req, res) {
    try {
        //TODO remove console.log
        console.log("Creating a new board...");

        const userId = req.user.id;
        const { name } = req.body;

        const createdBoard = await prisma.board.create({
            data: {
                name: name,
                user: {
                    connect: { id: userId },
                },
            },
        });

        if (!createdBoard) {
            return res.status(400).json({ message: "Could not create board" });
        }

        res.status(201).json(createdBoard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteBoard = async function (req, res) {
    try {
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
            return res.status(404).json({
                message: "Board not found or does not belong to the user",
            });
        }

        const columnIds = board.columns.map((column) => column.id);
        await prisma.task.deleteMany({
            where: {
                columnId: {
                    in: columnIds,
                },
            },
        });

        await prisma.column.deleteMany({
            where: {
                boardId: boardId,
            },
        });

        await prisma.board.delete({
            where: { id: boardId },
        });

        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateBoard = async function (req, res) {
    try {
        const userId = req.user.id;
        const boardId = req.params.boardId;
        const { name } = req.body;

        const board = await prisma.board.findUnique({
            where: { id: boardId, userId: userId },
        });

        if (!board) {
            return res.status(404).json({
                message: "Board not found or does not belong to the user",
            });
        }

        const updatedBoard = await prisma.board.update({
            where: { id: boardId },
            data: {
                name: name,
            },
        });

        res.status(200).json(updatedBoard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { getBoards, getBoard, createBoard, deleteBoard, updateBoard };
