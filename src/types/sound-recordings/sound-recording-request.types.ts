import SoundRecording from '../../models/SoundRecording';

export type CreateSoundRecordingInput = Omit<SoundRecording, "id"|"categories"> & {
    existingCategories?: string[];
    newCategories?: string[];
};

export type CreateSoundRecordingResult = Omit<SoundRecording, "imageFiles">;

export type GetSoundRecordingFileResult = {
    fileName: string;
    data: Buffer;
    size: number;
}