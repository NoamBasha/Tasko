import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 5, // Limit each IP to 5 requests per `window`.
    message: {
        message:
            "Too many login attempts from this IP, please try again after a minute pause",
    },
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

export default limiter;
