import Submission from './Submission';

export default interface User {
    username: string,
    email: string,
    hashedPassword: string,
    creationDate: Date,
    permission: string,
    submissions: Submission[]
}