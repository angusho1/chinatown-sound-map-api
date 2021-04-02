import express from 'express';
import { pool } from '../app';
const router = express.Router();

router.get('/', function(req, res, next) {
    pool.query('SELECT * FROM SoundClips', (error, results, fields) => {
        if (error) throw error;
        console.log(results);
        console.log(fields);
    });

    res.send('Respond with a resource');
});

export default router;