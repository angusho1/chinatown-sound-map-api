import bcrypt from 'bcrypt';
import User from '../models/User';
import HttpError from '../utils/HttpError.util';
import { db } from './db.service';

export async function createUser(email: string, password: string): Promise<number> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql: string = `INSERT INTO users (email, hashed_password, creation_date)
                        VALUES (?, ?, now())`;
    const params = [email, hashedPassword];
    let userId: number;

    await db.insert(sql, params)
        .catch(e => { 
            if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, e.sqlMessage, e);
        });
    userId = (await db.query('SELECT LAST_INSERT_ID()'))[0]['LAST_INSERT_ID()'];

    return userId;
}

export async function loginUser(email: string, password: string) {
    const sql: string = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const params = [email];
    const result = await db.query(sql, params);

    if (result.length === 0) {
        throw new HttpError(404, 'Email or password is incorrect');
    }
    
    const user = {
        id: result[0]['id'],
        username: result[0]['username'],
        email: result[0]['email'],
        creationDate: result[0]['creation_date'],
        hashedPassword: result[0]['hashed_password']
    };

    const authSuccessful = await bcrypt.compare(password, user.hashedPassword);

    if (!authSuccessful) {
        throw new HttpError(404, 'Email or password is incorrect');
    }

    return user;
}

export async function getUserById(id: string) {
    const sql: string = 'SELECT * FROM users WHERE id = ? LIMIT 1';
    const params = [id];
    const result = await db.query(sql, params);

    if (result.length === 0) {
        throw new HttpError(404, 'User not found');
    }

    const user = {
        id: result[0]['id'],
        username: result[0]['username'],
        email: result[0]['email'],
        creationDate: result[0]['creation_date']
    };

    return user;
}

export async function findOAuthUser(id: string, provider: string) {
    const providerField = `${provider}_id`;
    const sql: string = `SELECT * FROM users WHERE ${providerField} = ? LIMIT 1`;
    const params = [id];
    const result = await db.query(sql, params);

    if (result.length === 0) {
        return null;
    }

    const user = {
        id: result[0]['id'],
        username: result[0]['username'],
        email: result[0]['email'],
        creationDate: result[0]['creation_date'],
        [providerField]: result[0][providerField]
    };

    return user;
}

export async function createOAuthUser(providerId: string, email: string, provider: string) {
    const providerField = `${provider}_id`;
    const sql: string = `INSERT INTO users (${providerField}, email, creation_date)
    VALUES (?, ?, now())`;
    const params = [providerId, email];

    await db.insert(sql, params)
        .catch(e => { 
            if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, e.sqlMessage, e);
        });

    return await findOAuthUser(providerId, provider);
}

export default { createUser, loginUser, getUserById, findOAuthUser, createOAuthUser };