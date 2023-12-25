import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";

const createNewUser = asyncHandler(async function (req, res) {
    const { name, password, email } = req.body;

    if (!name || !password || !email) {
        res.status(400);
        throw new Error("Name, password, and email are required");
    }

    const isExist = await prisma.user.findUnique({
        where: { email: email },
    });

    if (isExist) {
        res.status(400);
        throw new Error("Email already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: hashedPassword,
            },
        });
        res.sendStatus(201);
    } catch (err) {
        res.status(500);
        throw new Error("Couldn't create user");
    }
});

const getMe = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500);
        throw new Error("Couldn't find user");
    }
});

export { createNewUser, getMe };
