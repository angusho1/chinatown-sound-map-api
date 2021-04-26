import bcrypt from 'bcrypt';
import User from '../models/User';
import HttpError from '../utils/HttpError.util';
import { db } from './db.service';

export async function createUser(email: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql: string = `INSERT INTO Users (email, hashed_password, creation_date)
                        VALUES (?, ?, now())`;
    const params = [email, hashedPassword];

    try {
        const result = await db.insert(sql, params);
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, e.sqlMessage, e);
    }

    return {
        username: '',
        email, 
        creationDate: null, 
        permission: '',
        submissions: []
    };
}


export default { createUser };