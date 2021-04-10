import mysql from 'mysql2';
import { FieldPacket, RowDataPacket } from 'mysql2';

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

async function query(sql: string, params?: any): Promise<RowDataPacket[]> {
    const [rows, ] = await pool.promise().execute(sql, params);

    return rows as RowDataPacket[];
}

export const db = { query };