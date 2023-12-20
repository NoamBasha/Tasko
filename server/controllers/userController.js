import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async function (req, res) {
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

const login = async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email: email } });

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = generateToken(user);

        const userToSend = {
            id: user.id,
            name: user.name,
        };

        res.status(200).json({ user: userToSend, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const generateToken = (user) => {
    //TODO set an expiration time and add refresh token
    // const expiresIn = "10s";
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
        // expiresIn,
    });
    return token;
};

export { login, register };
