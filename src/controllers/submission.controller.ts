import { Request, Response, NextFunction } from 'express';
import HttpError from '../utils/HttpError.util';
import multer from 'multer';
import CustomStorageEngine, { MAX_FILE_UPLOAD_SIZE } from '../utils/StorageEngine.util';

const storage = new CustomStorageEngine();

export function fileFilter(req, file, cb) {
    if (parseInt(req.headers["content-length"]) > MAX_FILE_UPLOAD_SIZE) {
        cb(new HttpError(400, 'File size is too large (max allowed size per file is 5MB).'), false);
    } else {
        cb(null, true);
    }
}

const upload = multer({ storage: storage, limits: { fileSize: MAX_FILE_UPLOAD_SIZE }, fileFilter });

const uploadFiles = upload.fields([
    { name: 'recording', maxCount: 1 },
    { name: 'image', maxCount: 3 }
]);

async function getSubmissions(req: Request, res: Response, next: NextFunction) {
    res.send('Submissions');
}

async function postSubmissions(req: Request, res: Response) {
    console.log(req.body);
    res.send({ message: 'success' });
}

export default { getSubmissions, postSubmissions, uploadFiles };