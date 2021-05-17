import HttpError from "../utils/HttpError.util";
import { Request, Response, NextFunction } from 'express';

export default function errorHandler(error, req: Request, res: Response, next: NextFunction) {
    if (!(error instanceof HttpError)) error = new HttpError(500, error.message, error.toString());
    if (error.status === 500) error.message = `Internal Server Error: ${error.message}`;

    console.error(error);
    res.status(error.status).send({ message: error.message, data: error.data });
}