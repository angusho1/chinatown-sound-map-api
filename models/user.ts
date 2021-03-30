import Submission from './submission';

export default interface User {
    username: string,
    email: string,
    role: string, // TODO: Create a role class
    creationDate: Date,
    submissions: Submission[] // starts to feel relational
}