import Submission from './Submission';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

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
    password: passwordComplexity({
        min: 8,
        max: 128,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 2,
    })
});