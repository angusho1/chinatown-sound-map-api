import SoundRecording from '../../models/SoundRecording';

export type CreateSoundRecordingInput = Omit<SoundRecording, "id"|"tags"|"shortName"> & {
    existingTags?: string[];
    newTags?: string[];
};

export type CreateSoundRecordingResult = Omit<SoundRecording, "imageFiles">;

export type GetSoundRecordingFileResult = {
    fileName: string;
    data: Buffer;
    size: number;
}