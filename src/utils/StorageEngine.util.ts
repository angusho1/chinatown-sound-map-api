import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { StorageEngine } from 'multer';
import { ParsedQs } from 'qs';
import fs from 'fs';
import HttpError from './HttpError.util';

export const MAX_FILE_UPLOAD_SIZE = 5 * (10 ** 6);

export default class CustomStorageEngine implements StorageEngine {

    _handleFile(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
      if (parseInt(req.headers["content-length"]) > MAX_FILE_UPLOAD_SIZE) {
        cb(new HttpError(400, 'File size is too large (max allowed size per file is 5MB).'));
        return;
      }

      const path = `src/public/clips/${file.originalname}`;
      console.log(file);
  
      const outStream = fs.createWriteStream(path);
  
      file.stream.pipe(outStream);
      outStream.on('error', cb);
      outStream.on('finish', function () {
        cb(null, {
          path,
          size: outStream.bytesWritten
        });
      });
    }
    _removeFile(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, file: Express.Multer.File, cb: (error: Error) => void): void {
        fs.unlink(file.path, cb);
    }
}