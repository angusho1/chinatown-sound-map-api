import SoundClip from '../models/SoundClip';
import Location from '../models/Location';
import { db } from './db';

export async function getSoundClips(): Promise<SoundClip[]> {
    const results = await db.query('SELECT * FROM SoundClips');

    const soundClips: SoundClip[] = results.map(res => {
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
