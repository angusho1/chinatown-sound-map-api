import SoundRecordingCategory from "../../models/SoundRecordingCategory";

export type CreateCategoryInput = {
    name: string;
}

export type CreateCategoryResult = SoundRecordingCategory & {
}

export type CreateCategoriesInput = {
    names: string[];
}

export type CreateCategoriesResult = {
    categoryIds: string[];
}