import mongoose from 'mongoose';
import Submission from './submission';
const { Schema } = mongoose;

export default interface User {
    username: string,
    email: string,
    role: string, // TODO: Create a role class
    creationDate: Date,
    submissions: Submission[] // starts to feel relational
}

const userSchema = new Schema({
    username: String,
    email: String,
    role: String,
    creationDate: Date,
    submissions: [Object]
});

export const userModel = mongoose.model('user', userSchema);