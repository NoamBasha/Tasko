import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    message: {
        message:
            "Too many login attempts from this IP, please try again after a minute pause",
    },
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

export default limiter;
