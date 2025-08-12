import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import PDFMerger from 'pdf-merger-js';


import { BUCKET, CASE_DB_PATH } from '../../config/config';
import { downloadFile } from './download';
import { s3Client } from '../../server';

import { Case } from '../cases/types';
import { GetObjectCommandOutput, PutObjectCommand } from '@aws-sdk/client-s3';

async function mergeFiles(caseId: string): Promise<GetObjectCommandOutput> {
	const filesListPath: string = path.join(process.cwd(), CASE_DB_PATH, `${caseId}.json`);
	const caseJson: Case = JSON.parse(await readFile(filesListPath, 'utf-8'));
	const mergedCaseFilename = caseJson.merged;

	if (mergedCaseFilename) {
		return await downloadFile(mergedCaseFilename);
	}

	const filesList: string[] = caseJson.filesList;
	const merger = new PDFMerger();

	for (const filename of filesList) {
		const pdfFileResponse = await downloadFile(filename);

		const pdfChunks: Uint8Array[] = [];

		// сужаем тип до Buffer, исключая тип String, который прописан в GetObjectCommandOutput.Body
		const pdfStream = pdfFileResponse.Body as NodeJS.ReadableStream & AsyncIterable<Buffer>;

		for await (const chunk of pdfStream) {
			pdfChunks.push(chunk);
		}

		const pdfBuffer =  Buffer.concat(pdfChunks);

		await merger.add(pdfBuffer);
	}

	const mergedPDFBuffer = await merger.saveAsBuffer();

	// получаем хэш md5 для имени файла
	const mergedFilename = `${createHash('md5').update(mergedPDFBuffer).digest('hex')}.pdf`;

	// Загружаем склеенный pdf файл в S3
	await s3Client.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: mergedFilename,
			Body: mergedPDFBuffer,
			ContentType: 'application/pdf',
		})
	);

	// Обновляем JSON, добавляя имя нового склеенного файла
	caseJson.merged = mergedFilename;
	await writeFile(filesListPath, JSON.stringify(caseJson, null, 4), 'utf-8');

	return await downloadFile(mergedFilename);
}

export { mergeFiles };
