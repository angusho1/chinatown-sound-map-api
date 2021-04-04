import express from 'express';
import { pool } from '../app';
import SoundClip from '../models/soundClip';
import Location from '../models/location';
const router = express.Router();

router.get('/', function(req, res, next) {
    pool.query('SELECT * FROM SoundClips', (error, results, fields) => {
        if (error) throw error;
        const soundClips: SoundClip[] = results.map(res => {
            const location: Location = { lat: res.latitude, lng: res.longitude, address: "" };
            return {
                title: res.title,
                author: res.author,
                description: res.description,
                location,
                date: res.date,
                categories: [],
                meta: null
            }
        });
        console.log(soundClips);
    });

    res.send('Respond with a resource');
});

export default router;