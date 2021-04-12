import { userSchema } from '../models/User';
import HttpError from '../utils/HttpError.util';

export function validateUser(req, res, next) {
    const { email, password } = req.body;
    const validation = userSchema.validate({ email, password });
    if (validation.hasOwnProperty('error')) {
        const error = validation.error;
        throw new HttpError(401, error.details[0].message, error.details[0].context);
    }
    next();
}