import * as SoundClipsService from '../services/sound-clips.service';

async function getSoundClips(req, res, next) {
    const result = await SoundClipsService.getSoundClips();
    res.send(result);
}

export default { getSoundClips }