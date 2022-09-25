import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { StorageEngine } from 'multer';
import { ParsedQs } from 'qs';
import fs from 'fs';
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

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

    const blockBlobClient = containerClient.getBlockBlobClient(file.originalname);
    blockBlobClient.uploadStream(file.stream)
      .then(uploadResult => {
        console.log('uploadResult', uploadResult);
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