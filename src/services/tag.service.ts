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

export async function createTags(input: CreateTagsInput): Promise<CreateTagsResult> {
    if (!input.names || input.names.length === 0) {
        return { tagIds: [] };
    }

    const tags = input.names.map(name => {
        return { tagId: uuidv4(), name };
    });

    const values = tags.map(tag => [ tag.tagId, tag.name ]);

    try {
        await db.insertMultiple(
            `INSERT INTO tags (id, name) VALUES ?`,
            values
        );
    } catch (e) {
        if ((e as any).errno === MysqlErrorCodes.ER_DUP_ENTRY) {
            throw new HttpError(400, `A provided tag already exists`);
        } else {
            throw e;
        }
    }

    const result = {
        tagIds: tags.map(tag => tag.tagId)
    };

    return result;
}

export async function tagExists(filter: { id?: string, name?: string }): Promise<boolean> {
    let rows;
    if (filter.id) {
        rows = await db.query(`SELECT id FROM tags WHERE id = ?`, [filter.id]);
    } else if (filter.name) {
        rows = await db.query(`SELECT id FROM tags WHERE name = ?`, [filter.name]);
    } else {
        throw new Error('Tag identifier was not provided');
    }
    return rows.length > 0;
}
