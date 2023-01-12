import SoundClip from '../models/SoundClip';
import Location from '../models/Location';
import { db } from './db.service';

export async function getSoundClips(): Promise<SoundClip[]> {
    const results = await db.query('SELECT * FROM sound_clips');

    const soundClips: SoundClip[] = results.map(res => {
        const location: Location = { lat: parseFloat(res.latitude), lng: parseFloat(res.longitude), address: "" };
        return {
            title: res.title,
            author: res.author,
            description: res.description,
            location,
            date: res.date,
            content: res.content,
            tags: [],
            meta: {
                plays: 0,
                likes: 0
            }
        }
    });

    return soundClips;
}
