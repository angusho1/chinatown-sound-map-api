import SoundRecording from '../../models/SoundRecording';

export type CreateSoundRecordingInput = Omit<SoundRecording, "id">;
export type CreateSoundRecordingResult = Omit<SoundRecording, "imageFiles">;