import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const login = asyncHandler(async (req, res) => {
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

    const accessToken = jwt.sign(
        {
            UserInfo: {
                userId: user.id,
                name: user.name,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m",
        }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    res.status(200).json({ accessToken });
});

const refresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user) return res.status(401).json({ message: "Unauthorized" });

            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        userId: user.id,
                        name: user.name,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "15m",
                }
            );

            res.json({ accessToken });
        })
    );
};

const logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204).json();
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(201).json({ message: "Cookie cleared" });
};

export { login, refresh, logout };
