import { NextFunction, Request, Response } from "express";
import { body, check, CustomSanitizer, CustomValidator, query, validationResult } from "express-validator";
import * as TagService from '../services/tag.service';
import { SubmissionSortField } from "../types/submissions/submisison-request.types";

export const MAX_TITLE_LEN = 100;
export const MAX_AUTHOR_NAME_LEN = 100;
export const MAX_DESCRIPTION_LEN = 1000;
export const MAX_TAG_LABEL_LENGTH = 40;
export const MAX_NUMBER_TAGS_PER_RECORDING = 5;

const parseJSONString: CustomSanitizer = (value: string) => JSON.parse(value);

const validateExistingTags: CustomValidator = async (value: string[]) => {
    await Promise.all(value.map(async (tagId: string) => {
        const exists = await TagService.tagExists({ id: tagId });
        if (!exists) return Promise.reject(`Tag with id ${tagId} doesn't exist`);
        return Promise.resolve();
    }));
    return true;
};

const validateNewTags: CustomValidator = async (value: string[]) => {
    await Promise.all(value.map(async (tagName: string) => {
        const exists = await TagService.tagExists({ name: tagName });
        if (exists) return Promise.reject(`Tag '${tagName}' already exists`);
        return Promise.resolve();
    }));
    return true;
};

const validateTagCount: CustomValidator = (value, { req }) => {
    console.log(req.body.existingTags);
    console.log(req.body.newTags);
    const existingTagsCount = req.body.existingTags ? req.body.existingTags.length : 0;
    const newTagsCount = req.body.newTags ? req.body.newTags.length : 0;
    if (existingTagsCount + newTagsCount > MAX_NUMBER_TAGS_PER_RECORDING) throw new Error(`Number of tags exceeds the allowed amount (${MAX_NUMBER_TAGS_PER_RECORDING})`);
    return true;
};

export const getSubmissionsValidator = [
    query('sort')
        .optional()
        .custom((val: SubmissionSortField | SubmissionSortField[]) => {
            const fields = Array.isArray(val) ? val as SubmissionSortField[] : [val];
            fields.forEach(field => {
                if (field !== 'dateCreated' && field !== 'title' && field !== 'author') throw new Error('Invalid sort parameter');
            });
            return true;
        }),
    query('desc')
        .optional()
        .custom(val => {
            const vals = Array.isArray(val) ? val : [val];
            vals.forEach(v => {
                if (v !== '' && v !== '1' && v !== 'true' && v !== 'false') throw new Error('Invalid sort parameter');
            });
            return true;
        }),
]

export const createSubmissionValidator = [
    body('title')
        .isString()
        .isLength({ min: 1, max: MAX_TITLE_LEN }),
    body('email')
        .optional()
        .isEmail(),
    body('author')
        .optional()
        .isLength({ min: 1, max: MAX_AUTHOR_NAME_LEN }),
    body('fileLocation')
        .isString(),
    body('description')
        .optional({ checkFalsy: true })
        .isLength({ min: 0, max: MAX_DESCRIPTION_LEN }),
    body('date')
        .optional()
        .toDate(),
    body('location')
        .isString()
        .customSanitizer(parseJSONString),
    body('location.lat')
        .exists()
        .isFloat({ min: -90, max: 90 }),
    body('location.lng')
        .exists()
        .isFloat({ min: -180, max: 180 }),
    body('existingTags')
        .optional()
        .isString()
        .customSanitizer(parseJSONString)
        .isArray()
        .bail(),
    body('newTags')
        .optional()
        .isString()
        .customSanitizer(parseJSONString)
        .isArray()
        .bail(),
    check('existingTags')
        .custom(validateTagCount)
        .bail(),
    body('existingTags')
        .custom(validateExistingTags),
    body('newTags')
        .custom(validateNewTags),
    body('imageFiles')
        .optional()
        .isArray()
];

export const validateResult = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        next(new Error('Validation Error'));
    } else {
        next();
    }
};