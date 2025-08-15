import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { FileArray, UploadedFile } from 'express-fileupload';

import { convertToPdf } from './convertToPdf';
import { s3Client } from '../../server';
import { BUCKET, CASE_DB_PATH } from '../../config/config';

import { ResultWithCase, ResultWithFile } from './types';
import { addFilesToCase } from './addFilesToCase';

async function uploadFile(caseId: string, data: FileArray): Promise<ResultWithCase> {
	// Проверка на загрузку одного файла
	if (Array.isArray(data.file)) {
		return {
			status: 400,
			message: 'Only one file can be uploaded',
		};
	}

	const casePath = path.join(process.cwd(), CASE_DB_PATH, `${caseId}.json`);
	const caseData = JSON.parse(await readFile(casePath, 'utf-8'));

	const uploadedFile: UploadedFile = data.file;
	const filename = uploadedFile.md5;
	const fileExtension = path.extname(uploadedFile.name);
	const filenameFull = filename + fileExtension;

	const uploadDocResult = await uploadYC(filenameFull, uploadedFile.data);

	if (uploadDocResult.$metadata.httpStatusCode != 200) {
		return {
			status: 400,
			message: 'Document was not uploaded'};
	}

	// конвертируем загруженный файл в pdf
	const convertResult = await convertToPdf(caseId, filename, uploadedFile.data);

	// добавить возможность конвертации файла, уже загруженного в хранилище
	if (!convertResult.data) {
		return {
			status: 400,
			message: 'Pdf was not created'
		}; 
	}

	// загружаем pdf в хранилище
	const uploadPdfResult = await uploadYC(`${filename}.pdf`, convertResult.data);

	// проверка статуса загрузки
	const status = uploadPdfResult.$metadata.httpStatusCode === 200 ? 200 : 400

	return {
		status: status,
		message: uploadPdfResult.$metadata.httpStatusCode === 200 ? 'Document and pdf was uploaded successfully'	: 'PDF was not uploaded',

		// добавляем данные о загруженном файле в case
		data: status === 200 ? (await addFilesToCase(caseId, `${filename}.pdf`)).data : undefined, 
	};
}

async function uploadYC(filenameFull: string, file: ResultWithFile['data']): Promise<PutObjectCommandOutput> {
	const command = new PutObjectCommand({
		Bucket: BUCKET,
		Key: filenameFull,
		Body: file,
	});

	return await s3Client.send(command);
}

export { uploadFile };
