import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import prisma from "./db/prisma.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import boardRouter from "./routes/boardRoutes.js";
import columnRouter from "./routes/columnRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = 3000;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/boards", boardRouter);
app.use("/api/v1/columns", columnRouter);
app.use("/api/v1/tasks", taskRouter);

// DATABASE RESETTING
// await prisma.task.deleteMany({});
// await prisma.column.deleteMany({});
// await prisma.board.deleteMany({});
// await prisma.user.deleteMany({});
// const remainingUsers = await prisma.user.findMany();
// console.log("Remaining users:", remainingUsers);
// const remainingBoards = await prisma.board.findMany();
// console.log("Remaining board:", remainingBoards);
// const remainingColumns = await prisma.column.findMany();
// console.log("Remaining column:", remainingColumns);
// const remainingTasks = await prisma.task.findMany();
// console.log("Remaining tasks:", remainingTasks);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

process.on("SIGINT", async () => {
    console.log("Shutting down gracefully");
    await prisma.$disconnect();
    process.exit(0);
});
