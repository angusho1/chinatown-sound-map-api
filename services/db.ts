import { pool } from '../app';
import { FieldPacket, RowDataPacket } from 'mysql2';

async function query(sql: string, params?: any): Promise<RowDataPacket[]> {
    const [rows, ] = await pool.promise().execute(sql, params);

    return rows as RowDataPacket[];
}

export const db = { query };