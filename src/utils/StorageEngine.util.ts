import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { StorageEngine } from 'multer';
import { ParsedQs } from 'qs';
import fs from 'fs';
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';

export const MAX_FILE_UPLOAD_SIZE = 5 * (10 ** 6);

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const RECORDINGS_CONTAINER = process.env.RECORDINGS_CONTAINER;
const IMAGES_CONTAINER = process.env.IMAGES_CONTAINER;
const recordingsContainerClient = blobServiceClient.getContainerClient(RECORDINGS_CONTAINER);
const imagesContainerClient = blobServiceClient.getContainerClient(IMAGES_CONTAINER);

const RECORDING_FIELDNAME = 'recording';
const IMAGE_FIELDNAME = 'image';

export default class CustomStorageEngine implements StorageEngine {

  _handleFile(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
    console.log(file);

    let containerClient: ContainerClient;
    switch (file.fieldname) {
      case RECORDING_FIELDNAME:
        containerClient = recordingsContainerClient;
        break;
      case IMAGE_FIELDNAME:
        containerClient = imagesContainerClient;
      default:
        break;
    }

    const blobName = `${uuidv4()}_${file.originalname}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    blockBlobClient.uploadStream(file.stream)
      .then(uploadResult => {
        if (file.fieldname === RECORDING_FIELDNAME) {
          req.body.fileLocation = blobName;
        } else if (file.fieldname === IMAGE_FIELDNAME) {
          if (req.body.imageFiles && Array.isArray(req.body.imageFiles)) {
            req.body.imageFiles.push(blobName);
          } else {
            req.body.imageFiles = [blobName];
          }
        }
        cb(null);
      })
      .catch(e => {
        console.log(`Error uploading file: ${file.originalname}`, e);
        cb(e);
      });
  }

  _removeFile(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, file: Express.Multer.File, cb: (error: Error) => void): void {
      fs.unlink(file.path, cb);
  }
}