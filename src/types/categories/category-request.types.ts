import SoundRecordingCategory from "../../models/SoundRecordingCategory";

export type CreateCategoryInput = {
    name: string;
}

export type CreateCategoryResult = SoundRecordingCategory & {
}