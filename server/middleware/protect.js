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

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid token" });
    }
};

export default protect;
