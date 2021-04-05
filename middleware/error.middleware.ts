import HttpError from "../utils/HttpError.utils";

export default function errorHandler(error, req, res, next) {
    if (!(error instanceof HttpError)) error = new HttpError(500, error.message, error.toString());
    if (error.status === 500) error.message = `Internal Server Error: ${error.message}`;

    console.error(error.message);
    res.status(error.status).send(error);
}