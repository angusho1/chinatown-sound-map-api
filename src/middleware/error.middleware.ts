import HttpError from "../utils/HttpError.util";
import { Request, Response, NextFunction } from 'express';

export default function errorHandler(error, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (!(error instanceof HttpError)) error = new HttpError(500, error.message ? error.message : error.toString(), error.toString());
    if (error.status === 500) error.message = `Internal Server Error: ${error.message}`;

    console.log(error);
    res.status(error.status);
    // res.json({ message: error.message, data: error.data });  // TODO: Prevent 'write after end' error
    res.end();
}