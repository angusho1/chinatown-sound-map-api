import SoundRecording from '../../models/SoundRecording';

export type CreateSoundRecordingInput = Omit<SoundRecording, "id"|"shortName"> & {
};

export type CreateSoundRecordingResult = Omit<SoundRecording, "imageFiles">;

export type GetSoundRecordingFileResult = {
    fileName: string;
    data: Buffer;
    size: number;
}