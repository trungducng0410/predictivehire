import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http.error";

const errorMiddleware = (
    error: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const status: number = error.status || 500;
        const message: string = error.message || "Internal server error";
        res.status(status).json({ error: message });
    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;
