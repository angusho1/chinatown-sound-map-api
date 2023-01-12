import SoundRecordingTag from "../../models/SoundRecordingTag";

export type CreateTagInput = {
    name: string;
}

export type CreateTagResult = SoundRecordingTag & {
}

export type CreateTagsInput = {
    names: string[];
}

export type CreateTagsResult = {
    tagIds: string[];
}