
import { Request, Response, NextFunction } from 'express';
import * as TagService from '../services/tag.service';
import HttpError from '../utils/HttpError.util';

export async function getTags(req: Request, res: Response, next: NextFunction) {
    const result = await TagService.getTags();
    res.status(200).json(result);
}

export async function createTag(req: Request, res: Response, next: NextFunction) {
    try {
        const tagName = req.body.name;

        const soundRecording = await TagService.createTag({
            name: tagName,
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

export default { getTags, createTag };