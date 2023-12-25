import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";

const createNewUser = asyncHandler(async function (req, res) {
    const { name, password, email } = req.body;

    if (!name || !password || !email) {
        return res
            .status(400)
            .json({ message: "Name, password, and email are required" });
    }

    const isExist = await prisma.user.findUnique({
        where: { email: email },
    });

    if (isExist) {
        return res.status(400).json({ message: "Email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createdUser = await prisma.user.create({
        data: {
            email: email,
            name: name,
            password: hashedPassword,
        },
    });

    if (!createdUser) {
        return res.status(500).json({ message: "Couldn't create user" });
    }

    res.sendStatus(201);
});

const getMe = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    res.status(200).json(user);
});

export { createNewUser, getMe };
