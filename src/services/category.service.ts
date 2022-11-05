import { db } from './db.service';
import { v4 as uuidv4 } from 'uuid';
import SoundRecordingCategory from '../models/SoundRecordingCategory';
import { CreateCategoriesInput, CreateCategoriesResult, CreateCategoryInput, CreateCategoryResult } from '../types/categories/category-request.types';
import { MysqlErrorCodes } from 'mysql-error-codes';
import HttpError from '../utils/HttpError.util';

export async function getCategories(): Promise<SoundRecordingCategory[]> {
    const rows = await db.query(`
        SELECT id, name
        FROM categories
    `);

    const categories: SoundRecordingCategory[] = rows.map(row => {
        return {
            id: row.id,
            name: row.name,
        }
    });

    return categories;
}

export async function createCategory(category: CreateCategoryInput): Promise<CreateCategoryResult> {
    const name = category.name;
    const categoryId = uuidv4();

    try {
        await db.insert(
            `INSERT INTO categories (id, name) VALUES (?, ?)`,
            [
                categoryId,
                name,
            ]
        );
    } catch (e) {
        if ((e as any).errno === MysqlErrorCodes.ER_DUP_ENTRY) {
            throw new HttpError(400, `Category named '${name}' already exists`);
        } else {
            throw e;
        }
    }

    const submissionResult = {
        id: categoryId,
        name: name,
    }

    return submissionResult;
}

export async function createCategories(input: CreateCategoriesInput): Promise<CreateCategoriesResult> {
    if (!input.names || input.names.length === 0) {
        return { categoryIds: [] };
    }

    const categories = input.names.map(name => {
        return { categoryId: uuidv4(), name };
    });

    const values = categories.map(category => [ category.categoryId, category.name ]);

    try {
        await db.insertMultiple(
            `INSERT INTO categories (id, name) VALUES ?`,
            values
        );
    } catch (e) {
        if ((e as any).errno === MysqlErrorCodes.ER_DUP_ENTRY) {
            throw new HttpError(400, `A provided category already exists`);
        } else {
            throw e;
        }
    }

    const result = {
        categoryIds: categories.map(category => category.categoryId)
    };

    return result;
}