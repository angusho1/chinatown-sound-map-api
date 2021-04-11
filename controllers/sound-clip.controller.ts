import * as SoundClipService from '../services/sound-clip.service';

async function getSoundClips(req, res, next) {
    const result = await SoundClipService.getSoundClips();
    res.send(result);
}

export default { getSoundClips }