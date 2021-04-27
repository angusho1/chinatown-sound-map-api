import bcrypt from 'bcrypt';
import User from '../models/User';
import HttpError from '../utils/HttpError.util';
import { db } from './db.service';

export async function createUser(email: string, password: string): Promise<number> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql: string = `INSERT INTO Users (email, hashed_password, creation_date)
                        VALUES (?, ?, now())`;
    const params = [email, hashedPassword];
    let userId: number;

    try {
        await db.insert(sql, params);
        userId = (await db.query('SELECT LAST_INSERT_ID()'))[0]['LAST_INSERT_ID()'];
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, e.sqlMessage, e);
    }

    return userId;
}

export async function loginUser(email: string, password: string) {
    return;
}


export default { createUser, loginUser };