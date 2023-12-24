import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";

const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res
                .status(401)
                .json({ message: "Authorization token is missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = await prisma.user.findUnique({
            where: { id: decoded.UserInfo.userId },
        });

        next();
    } catch (error) {
        // console.error(error);
        res.status(401).json({ message: "Invalid access token" });
    }
};

export default protect;
