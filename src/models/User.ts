import Submission from './Submission';
import Joi from 'joi';

export default interface User {
    username: string,
    email: string,
    hashedPassword: string,
    creationDate: Date,
    permission: string,
    submissions: Submission[]
}

export const userSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required()
        .messages({
            'string.email': 'Email address is invalid'
        }),
    password: Joi.string()
        .alphanum()
        .min(8)
        .max(128)
        // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$"))
        .required()
        .messages({
            'string.min': 'Password must contain at least 8 characters',
            'string.max': 'Password must contain at most 128 chaaracters',
            'string.alphanum': 'Password must contain alphanumeric characters only'
            // 'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        })
});