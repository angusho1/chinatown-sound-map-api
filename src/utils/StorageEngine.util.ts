import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { StorageEngine } from 'multer';
import { ParsedQs } from 'qs';
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';
import HttpError from './HttpError.util';
import { FileType } from '../types/sound-recordings/file-type.enum';

export const MAX_FILE_UPLOAD_SIZE = 5 * (10 ** 6);

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const RECORDINGS_CONTAINER = process.env.RECORDINGS_CONTAINER;
const IMAGES_CONTAINER = process.env.IMAGES_CONTAINER;
export const RecordingsContainerClient = blobServiceClient.getContainerClient(RECORDINGS_CONTAINER);
export const ImagesContainerClient = blobServiceClient.getContainerClient(IMAGES_CONTAINER);

export const getContainerClient = (fileType: FileType): ContainerClient => {
  switch (fileType) {
    case FileType.RECORDING:
      return RecordingsContainerClient;
    case FileType.IMAGE:
      return ImagesContainerClient;
    default:
      break;
  }
};

export const removeFile = async (containerClient: ContainerClient, blobName: string) => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return await blockBlobClient.deleteIfExists({ deleteSnapshots: 'include' });
};

export default class AzureStorageEngine implements StorageEngine {

  _handleFile(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
    const containerClient = getContainerClient(file.fieldname as FileType);
    const blobName = `${uuidv4()}_${file.originalname}`;
    file.path = blobName;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    blockBlobClient.uploadStream(file.stream)
      .then(uploadResult => {
        if (file.fieldname === FileType.RECORDING) {
          req.body.fileLocation = blobName;
        } else if (file.fieldname === FileType.IMAGE) {
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
    const containerClient = getContainerClient(file.fieldname as FileType);
    const blobName = file.path;

    if (!blobName) cb(new HttpError(400, 'File path was not found'));

    removeFile(containerClient, blobName)
      .then(res => {
        cb(null);
        console.log(`Removed file ${blobName}`);
      })
      .catch(e => cb(e));
  }
}
