if (process.env.ENV_FILE_PATH) {
    require('dotenv').config({ path: process.env.ENV_FILE_PATH });
} else {
    require('dotenv').config();
}

import * as SoundRecordingService from '../src/services/sound-recording.service';
import { db } from '../src/services/db.service';
import { FileType } from '../src/types/sound-recordings/file-type.enum';
import { getContainerClient } from '../src/utils/StorageEngine.util';

const removeFile = (name: string, type: FileType) => {
    const containerClient = getContainerClient(type);
    const blockBlobClient = containerClient.getBlockBlobClient(name);
    return blockBlobClient.deleteIfExists({ deleteSnapshots: 'include' });
}

const deleteAllRecordings = async () => {
    const recordings = await SoundRecordingService.getPublishedSoundRecordings();
    const deleteFiles = recordings.map(async (recording) => {
        await removeFile(recording.fileLocation, FileType.RECORDING);

        await Promise.all(recording.imageFiles.map(filename => removeFile(filename, FileType.IMAGE)));
    });

    await Promise.all(deleteFiles);

    await db.query(`DELETE FROM sound_recording_taggings WHERE sound_recording_id != QUOTE('')`);
    await db.query(`DELETE FROM publications WHERE submission_id != QUOTE('')`);
    await db.query(`DELETE FROM submissions WHERE id != QUOTE('')`);
    await db.query(`DELETE FROM sound_recording_images WHERE sound_recording_id != QUOTE('')`);
    await db.query(`DELETE FROM sound_recordings WHERE id != QUOTE('')`);

    console.log('Recordings deleted');
    
    process.exit(0);
};

deleteAllRecordings();