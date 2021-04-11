import bcrypt from 'bcrypt';
import User from '../models/User';
import { db } from './db.service';

export async function createUser(email: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql: string = `INSERT INTO Users (email, hashed_password, creation_date)
                        VALUES (?, ?, now())`;
    const params = [email, hashedPassword];

    const result = await db.insert(sql, params);

    return {
        username: '',
        email, hashedPassword, 
        creationDate: null, 
        permission: '',
        submissions: []
    };
}


export default { createUser };