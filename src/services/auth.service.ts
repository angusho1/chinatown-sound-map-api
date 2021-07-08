import bcrypt from 'bcrypt';
import User from '../models/User';
import HttpError from '../utils/HttpError.util';
import { db } from './db.service';

export async function createUser(email: string, password: string): Promise<number> {
    const userExists: boolean = await doesUserExist(email);
    if (userExists) {
        throw new HttpError(409, 'An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql: string = `INSERT INTO users (email, hashed_password, creation_date)
                        VALUES (?, ?, now())`;
    const params = [email, hashedPassword];
    let userId: number;

    await db.insert(sql, params);
    userId = (await db.query('SELECT LAST_INSERT_ID()'))[0]['LAST_INSERT_ID()'];

    return userId;
}

export async function doesUserExist(email: string): Promise<boolean> {
    const sql: string = `SELECT users.id, users.email, auth_identities.provider_user_key
        FROM users
        LEFT JOIN auth_identities ON users.id = auth_identities.user_id
        WHERE users.email = ? and auth_identities.provider_user_key IS NULL;`;
    const params = [email];
    const result = await db.query(sql, params);
    if (result.length > 0) {
        return true;
    }
    return false;
}

export async function validateUser(email: string, password: string) {
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

export async function findOAuthUser(providerUserId: string, provider: string) {
    const sql: string = 
        `SELECT
            users.id,
            users.username,
            users.email,
            users.creation_date,
            auth_identities.provider_user_key,
            auth_providers.name
        FROM auth_identities
        INNER JOIN users ON users.id = auth_identities.user_id
        INNER JOIN auth_providers ON auth_providers.id = auth_identities.provider_id
        WHERE auth_identities.provider_user_key = ? AND auth_providers.name = ? LIMIT 1`;
    const params = [providerUserId, provider];
    const result = await db.query(sql, params);

    console.log('finding the result');
    console.log(result);

    if (result.length === 0) {
        return null;
    }

    const user = {
        id: result[0]['id'],
        username: result[0]['username'],
        email: result[0]['email'],
        creationDate: result[0]['creation_date'],
    };

    return user;
}

export async function createOAuthUser(providerUserId: string, email: string, provider: string) {
    const providerIdResult = await db.query(`SELECT id FROM auth_providers WHERE name = ?`, [provider]);
    if (providerIdResult.length === 0) throw new HttpError(404, `Social login provider "${provider}" is not valid.`);
    const providerId = providerIdResult[0]['id'];

    const insertUserResult = await db.insert(`INSERT INTO users (email, creation_date) VALUES (?, now())`, [email]);
    const userId = insertUserResult.insertId;

    const insertAuthIdentityResult = await db.insert(`INSERT INTO auth_identities (provider_user_key, user_id, provider_id) VALUES (?, ?, ?)`, [providerUserId, userId, providerId]);
    //     .catch(e => { 
    //         if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, e.sqlMessage, e);
    //     });

    return await findOAuthUser(providerUserId, provider);
}

export default { createUser, validateUser, getUserById, findOAuthUser, createOAuthUser };