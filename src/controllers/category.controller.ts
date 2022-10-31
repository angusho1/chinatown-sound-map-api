
import { Request, Response, NextFunction } from 'express';
import * as CategoryService from '../services/category.service';
import HttpError from '../utils/HttpError.util';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
    const result = await CategoryService.getCategories();
    res.status(200).json(result);
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const categoryName = req.body.name;

        const soundRecording = await CategoryService.createCategory({
            name: categoryName,
        });

        const resBody = {
            result: {
                ...soundRecording,
            }
        }

        res.status(201).send(resBody);
    } catch (e) {
        next(e);
    }
}

export default { getCategories, createCategory };