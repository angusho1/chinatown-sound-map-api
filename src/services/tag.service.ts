import { db } from './db.service';
import { v4 as uuidv4 } from 'uuid';
import SoundRecordingTag from '../models/SoundRecordingTag';
import { CreateTagsInput, CreateTagsResult, CreateTagInput, CreateTagResult } from '../types/tags/tag-request.types';
import { MysqlErrorCodes } from 'mysql-error-codes';
import HttpError from '../utils/HttpError.util';

export async function getTags(): Promise<SoundRecordingTag[]> {
    const rows = await db.query(`
        SELECT id, name
        FROM tags
    `);

    const tags: SoundRecordingTag[] = rows.map(row => {
        return {
            id: row.id,
            name: row.name,
        }
    });

    return tags;
}

export async function createTag(tag: CreateTagInput): Promise<CreateTagResult> {
    const name = tag.name;
    const tagId = uuidv4();

    try {
        await db.insert(
            `INSERT INTO tags (id, name) VALUES (?, ?)`,
            [
                tagId,
                name,
            ]
        );
    } catch (e) {
        if ((e as any).errno === MysqlErrorCodes.ER_DUP_ENTRY) {
            throw new HttpError(400, `Tag named '${name}' already exists`);
        } else {
            throw e;
        }
    }

    const submissionResult = {
        id: tagId,
        name: name,
    }

    return submissionResult;
}

export async function createTagsIfNew(input: CreateTagsInput): Promise<CreateTagsResult> {
    const tags = input.tags;
    const existingTags: SoundRecordingTag[] = [];
    const newTagNames: string[] = [];

    await Promise.all(tags.map(async (tag: SoundRecordingTag) => {
        if (!tag.id) {
            const existingTag = await getTagIfExists({ name: tag.name });
            if (existingTag) existingTags.push(existingTag);
            else newTagNames.push(tag.name);
        } else {
            const existingTag = await getTagIfExists({ id: tag.id });
            if (existingTag) existingTags.push(existingTag);
            else throw new HttpError(400, `Tag with ID ${tag.id} was not found`);
        }
    }));

    const tagsToCreate = newTagNames.map(name => {
        return { id: uuidv4(), name };
    });

    const values = tagsToCreate.map(tag => [ tag.id, tag.name ]);

    try {
        if (tagsToCreate.length > 0) {
            await db.insertMultiple(
                `INSERT INTO tags (id, name) VALUES ?`,
                values
            );
        }
    } catch (e) {
        if ((e as any).errno === MysqlErrorCodes.ER_DUP_ENTRY) {
            throw new HttpError(400, `A provided tag already exists`);
        } else {
            throw e;
        }
    }

    const result = {
        tags: existingTags.concat(tagsToCreate),
    };

    return result;
}

export async function getTagIfExists(filter: { id?: string, name?: string }): Promise<SoundRecordingTag> {
    let rows;
    if (filter.id) {
        rows = await db.query(`SELECT id FROM tags WHERE id = ?`, [filter.id]);
    } else if (filter.name) {
        rows = await db.query(`SELECT id FROM tags WHERE name = ?`, [filter.name]);
    } else {
        throw new Error('Tag identifier was not provided');
    }
    return rows.length > 0 ? { id: rows[0].id, name: rows[0].name } : null;
}
