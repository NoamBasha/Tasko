const errorHandler = (err, req, res, next) => {
    const status = res.statusCode ? res.statusCode : 500;
    res.status(status).json({ message: err.message });
};

export default errorHandler;
