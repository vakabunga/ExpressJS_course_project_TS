import path from 'node:path';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { FileArray, UploadedFile } from 'express-fileupload';

import { convertToPdf } from './convertToPdf';

import { FunctionResult } from './types';
import { s3Client } from '../../server';
import { BUCKET } from '../../config/config';

async function uploadFile(caseId: string, data: FileArray): Promise<FunctionResult> {
	if (Array.isArray(data.file)) {
		return {
			status: 400,
			message: 'Only one file can be uploaded',
		};
	}

	const uploadedFile: UploadedFile = data.file;
	const fileName = uploadedFile.md5;
	const fileExtension = path.extname(uploadedFile.name);
	const fileNameFull = fileName + fileExtension;

	const uploadDocResult = await uploadYC(fileNameFull, uploadedFile.data);

  if (uploadDocResult.$metadata.httpStatusCode != 200) {
    return { status: 400, message: 'Document was not uploaded' }
  }

	const convertResult = await convertToPdf(caseId, fileName, uploadedFile.data);

  if (!convertResult.data) {
    return { status: 400, message: 'Pdf was not created'}; // добавить возможность конвертации файла, уже загруженного в хранилище
  }

  const uploadPdfResult = await uploadYC(`${fileName}.pdf`, convertResult.data);

	return {
    status: uploadPdfResult.$metadata.httpStatusCode === 200 ? 200 : 400,
    message: uploadPdfResult.$metadata.httpStatusCode === 200 ? 'Document and pdf was uploaded successfully' : 'PDF was not uploaded'
  }
}

async function uploadYC(fileNameFull: string, file: Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike>): Promise<PutObjectCommandOutput> {
	const command = new PutObjectCommand({
		Bucket: BUCKET,
		Key: fileNameFull,
		Body: file,
	});

	return await s3Client.send(command);
}

export { uploadFile };
