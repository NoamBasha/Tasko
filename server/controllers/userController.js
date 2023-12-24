import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";

const createNewUser = async function (req, res) {
    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getMe = async (req, res) => {
    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
export { createNewUser, getMe };
