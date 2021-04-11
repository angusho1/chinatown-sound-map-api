import bcrypt from 'bcrypt';
import User from '../models/User';
import { db } from './db.service';

export async function createUser(email: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = db.query(`INSERT INTO Users (email, hashed_password, creation_date)
                             VALUES ('${email}', '${hashedPassword}', now())`);

    return null;
}


export default { createUser };