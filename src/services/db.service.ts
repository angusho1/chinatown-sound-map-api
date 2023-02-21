import mysql, { ResultSetHeader } from 'mysql2';
import { FieldPacket, RowDataPacket } from 'mysql2';
import fs from 'fs';

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    namedPlaceholders: true,
    // ssl: process.env.NODE_ENV === 'production' ? {
    //     rejectUnauthorized: true,
    //     ca: [fs.readFileSync(process.env.MYSQL_SSL_CA_FILE_PATH, "utf8")]
    // } : undefined,
});

async function query(sql: string, params?: any): Promise<RowDataPacket[]> {
    const [rows, fields] = await pool.promise().execute(sql, params);

    return rows as RowDataPacket[];
}

async function insert(sql: string, params?: any): Promise<ResultSetHeader> {
    const [result, fields] = await pool.promise().execute(sql, params);

    return result as ResultSetHeader;
}

async function insertMultiple(sql: string, values?: any): Promise<ResultSetHeader> {
    const [result, fields] = await pool.promise().query(sql, [values]);

    return result as ResultSetHeader;
}

async function update(sql: string, params?: any): Promise<ResultSetHeader> {
    const [result, fields] = await pool.promise().execute(sql, params);

    return result as ResultSetHeader;
}

export const db = { query, insert, insertMultiple, update };