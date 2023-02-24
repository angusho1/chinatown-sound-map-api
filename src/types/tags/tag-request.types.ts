import SoundRecordingTag from "../../models/SoundRecordingTag";

export type CreateTagInput = {
    name: string;
}

export type CreateTagResult = SoundRecordingTag & {
}

export type CreateTagsInput = {
    tags: SoundRecordingTag[];
}

export type CreateTagsResult = {
    tags: SoundRecordingTag[];
}