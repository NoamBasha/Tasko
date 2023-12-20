import express from "express";
import prisma from "./db/prisma.js";
import userRouter from "./routes/userRoutes.js";
import boardRouter from "./routes/boardRoutes.js";
import columnRouter from "./routes/columnRoutes.js";
import taskRouter from "./routes/taskRoutes.js";

import cors from "cors";

const app = express();
const PORT = 3000;

// //TODO remove
// const users = await prisma.user.findMany();
// console.log(users);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/boards", boardRouter);
app.use("/api/v1/columns", columnRouter);
app.use("/api/v1/tasks", taskRouter);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

process.on("SIGINT", async () => {
    console.log("Shutting down gracefully");
    await prisma.$disconnect();
    process.exit(0);
});
