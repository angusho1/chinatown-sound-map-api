import { userSchema } from '../models/User';
import HttpError from '../utils/HttpError.util';
import UserService from '../services/user.service';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function validateUser(req: Request, res: Response, next: NextFunction) {
    const { email, password, passwordConfirmation } = req.body;
    const validation = userSchema.validate({ email, password, passwordConfirmation });
    if (validation.hasOwnProperty('error')) {
        const error = validation.error;
        throw new HttpError(401, error.details[0].message, error.details[0].context);
    }
    next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.jwt;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          next(new HttpError(401, err.messsage, err));
        } else {
          console.log(decodedToken);
          next();
        }
      });
    } else {
        next(new HttpError(401, 'No valid authentication credentials'));
    }
}