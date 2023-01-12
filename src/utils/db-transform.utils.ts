import SoundRecordingTag from "../models/SoundRecordingTag";

export const SQL_TAG_COLUMN_DELIMITER = ';';
export const SQL_TAG_ROW_DELIMITER = ',';

export const SELECT_TAGS_BY_RECORDING_SERIALIZED = `
    SELECT st.sound_recording_id AS id, GROUP_CONCAT(
        CONCAT(t.id, '${SQL_TAG_COLUMN_DELIMITER}', t.name)
        SEPARATOR '${SQL_TAG_ROW_DELIMITER}'
    ) AS tag_str
    FROM sound_recording_taggings st
    JOIN tags t ON t.id = st.tag_id
    GROUP BY st.sound_recording_id
`;

export const deserializeTags = (tagStr: string): SoundRecordingTag[] => {
    if (!tagStr) return [];
    return tagStr.split(SQL_TAG_ROW_DELIMITER).map(tagStr => {
        const splitStr = tagStr.split(SQL_TAG_COLUMN_DELIMITER);
        return {
            id: splitStr[0],
            name: splitStr[1],
        }
    });
};