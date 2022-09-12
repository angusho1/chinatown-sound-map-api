import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { StorageEngine } from 'multer';
import { ParsedQs } from 'qs';
import fs from 'fs';

export default class CustomStorageEngine implements StorageEngine {

    _handleFile(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
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