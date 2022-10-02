import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { StorageEngine } from 'multer';
import { ParsedQs } from 'qs';
import fs from 'fs';
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';
import HttpError from './HttpError.util';

export const MAX_FILE_UPLOAD_SIZE = 5 * (10 ** 6);

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const RECORDINGS_CONTAINER = process.env.RECORDINGS_CONTAINER;
const IMAGES_CONTAINER = process.env.IMAGES_CONTAINER;
export const RecordingsContainerClient = blobServiceClient.getContainerClient(RECORDINGS_CONTAINER);
export const ImagesContainerClient = blobServiceClient.getContainerClient(IMAGES_CONTAINER);

export const RECORDING_FIELDNAME = 'recording';
export const IMAGE_FIELDNAME = 'image';

export default class AzureStorageEngine implements StorageEngine {

  _handleFile(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
    console.log(file);

    const containerClient = this.getContainerClient(file);
    const blobName = `${uuidv4()}_${file.originalname}`;
    file.path = blobName;

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
    const containerClient = this.getContainerClient(file);
    const blobName = file.path;

    if (!blobName) cb(new HttpError(400, 'File path was not found'));
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    blockBlobClient.deleteIfExists({ deleteSnapshots: 'include' })
      .then(res => cb(null))
      .catch(e => cb(e));
  }

  private getContainerClient(file: Express.Multer.File): ContainerClient {
    switch (file.fieldname) {
      case RECORDING_FIELDNAME:
        return RecordingsContainerClient;
      case IMAGE_FIELDNAME:
        return ImagesContainerClient;
      default:
        break;
    }
  }
}