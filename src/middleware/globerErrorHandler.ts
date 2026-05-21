import type { NextFunction, Request, Response } from "express";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred.',
        error: err.message,
    });
};

export default globalErrorHandler;