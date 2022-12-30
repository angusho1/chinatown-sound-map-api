import SoundRecordingCategory from "../models/SoundRecordingCategory";

export const SQL_CATEGORIZATION_COLUMN_DELIMITER = ';';
export const SQL_CATEGORIZATION_ROW_DELIMITER = ',';

export const SELECT_CATEGORIZATIONS_BY_RECORDING_SERIALIZED = `
    SELECT sc.sound_recording_id AS id, GROUP_CONCAT(
        CONCAT(c.id, '${SQL_CATEGORIZATION_COLUMN_DELIMITER}', c.name)
        SEPARATOR '${SQL_CATEGORIZATION_ROW_DELIMITER}'
    ) AS cat_str
    FROM sound_recording_categorizations sc
    JOIN categories c ON c.id = sc.category_id
    GROUP BY sc.sound_recording_id
`;

export const deserializeCategorizations = (categoryStr: string): SoundRecordingCategory[] => {
    if (!categoryStr) return [];
    return categoryStr.split(SQL_CATEGORIZATION_ROW_DELIMITER).map(categoryStr => {
        const splitStr = categoryStr.split(SQL_CATEGORIZATION_COLUMN_DELIMITER);
        return {
            id: splitStr[0],
            name: splitStr[1],
        }
    });
};