const errorHandler = (err, req, res, next) => {
    const status = res.statusCode ? res.statusCode : 500;
    console.log(status, err.message);
    res.status(status).json({ message: err.message });
};

export default errorHandler;
