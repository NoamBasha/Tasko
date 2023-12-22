import prisma from "../db/prisma.js";

const createColumn = async function (req, res) {
    try {
        const userId = req.user.id;
        const boardId = +req.params.boardId;
        const { title, index } = req.body;

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

//TODO remove E2E?
const updateTwoColumns = async function (req, res) {
    try {
        const userId = req.user.id;
        const boardId = +req.params.boardId;
        const firstColumnId = +req.params.firstColumnId;
        const secondColumnId = +req.params.secondColumnId;
        const { firstNewColumn, secondNewColumn } = req.body;

        const board = await prisma.board.findUnique({
            where: { id: boardId, userId: userId },
        });

        if (!board) {
            return res.status(401).json({
                message: "Could not find board or user is not authorized",
            });
        }

        // Use a Prisma transaction to update two columns
        const transaction = await prisma.$transaction([
            prisma.column.update({
                where: { id: firstColumnId },
                data: {
                    index: firstNewColumn.index,
                },
            }),
            prisma.column.update({
                where: { id: secondColumnId },
                data: {
                    index: secondNewColumn.index,
                },
            }),
        ]);

        res.status(200).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateAllColumns = async function (req, res) {
    try {
        const userId = req.user.id;
        const boardId = +req.params.boardId;
        const newColumns = req.body;

        console.log("1");

        const board = await prisma.board.findUnique({
            where: { id: boardId, userId: userId },
        });

        console.log("2");

        if (!board) {
            return res.status(401).json({
                message: "Could not find board or user is not authorized",
            });
        }

        console.log("3");

        for (const column of newColumns) {
            const columnId = +column.id;

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
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }

        console.log("4");

        const prismaPromisesArray = newColumns.map((column) => {
            const columnId = +column.id;

            return prisma.column.update({
                where: { id: columnId },
                data: {
                    index: +column.index,
                },
            });
        });
        console.log("5");

        // Use a Prisma transaction to update all columns in the array
        const transactionResults = await prisma.$transaction(
            prismaPromisesArray
        );
        console.log("6");
        res.status(200).json(transactionResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
export {
    createColumn,
    deleteColumn,
    updateColumn,
    updateTwoColumns,
    updateAllColumns,
};
