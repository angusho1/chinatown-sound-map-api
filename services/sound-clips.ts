import { pool } from '../app';

import SoundClip from '../models/SoundClip';
import Location from '../models/Location';
import { FieldPacket, RowDataPacket } from 'mysql2';

export async function getSoundClips(): Promise<SoundClip[]> {
    const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await pool.promise().execute('SELECT * FROM SoundClips');

    const soundClips: SoundClip[] = rows.map(res => {
        const location: Location = { lat: res.latitude, lng: res.longitude, address: "" };
        return {
            title: res.title,
            author: res.author,
            description: res.description,
            location,
            date: res.date,
            categories: [],
            meta: {
                plays: 0,
                likes: 0
            }
        }
    });

    return soundClips;
}
