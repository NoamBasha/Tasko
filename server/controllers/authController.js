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
            //TODO: change to 15 minutes
            expiresIn: "15m",
        }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        {
            //TODO: change to a few days (lets say 7)
            expiresIn: "7d",
        }
    );

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
});

const refresh = async (req, res) => {
    console.log("1");
    const cookies = req.cookies;
    console.log("2");
    console.log(cookies);
    console.log(cookies?.jwt);
    if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });
    console.log("3");

    const refreshToken = cookies.jwt;
    console.log("4");

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            console.log("6");

            try {
                if (err) return res.status(403).json({ message: "Forbidden" });
                console.log("7");

                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                });
                console.log("8");

                if (!user)
                    return res.status(401).json({ message: "Unauthorized" });
                console.log("9");

                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            userId: user.id,
                            name: user.name,
                        },
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        //TODO: change to 15 minutes
                        expiresIn: "15m",
                    }
                );
                console.log("10");

                res.json({ accessToken });
            } catch (error) {
                console.error(error);
                console.log("11");

                res.status(500).json({ message: "Internal Server Error" });
            }
        }
    );
    console.log("5");
};

const logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204).json();
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(201).json({ message: "Cookie cleared" });
};

export { login, refresh, logout };
