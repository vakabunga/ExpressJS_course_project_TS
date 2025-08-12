import express, { Request, Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';

import { addFilesToCase } from './models/files/addFilesToCase';
import { createCase } from './models/cases/create';
import { downloadFile } from './models/files/download';
import { getCasesList } from './models/cases/list';
import { mergeFiles } from './models/files/mergeFiles';
import { uploadFile } from './models/files/upload';

import { GetObjectCommandOutput } from '@aws-sdk/client-s3';

const app = express();

app.use(express.json());

app.get('/ping', (req, res) => {
	res.send('pong');
});

app.get('/case/list', async (req, res) => {
	const casesList = await getCasesList();

	res.send(casesList);
});

app.post('/case/create', async (req: Request<unknown, unknown, string>, res) => {
	const caseData = await createCase(req.body);

	res.send({ success: true, ...caseData });
});

app.use('/files/upload/:id', fileUpload());
app.post('/files/upload/:id', async (req: Request<{ id: string }, unknown, UploadedFile>, res) => {
	if (!req.files) {
		res.sendStatus(400);
		res.send('Files are not uploaded');
		return;
	}

	const caseId = req.params.id;

	const response = await uploadFile(caseId, req.files);

	if (response.data === undefined) {
		res.sendStatus(400);
		res.send({ success: false, message: 'failed to upload' });
		return;
	}

	const filesList = response.data.filesList;
	const editCaseResult = await addFilesToCase(caseId, filesList[filesList.length - 1]);

	res.send(editCaseResult);
});

app.get('/files/download/:filename', async (req: Request<unknown, unknown, unknown, { filename: string }>, res: Response) => {
	const filename: string = req.query.filename;

	const s3Response: GetObjectCommandOutput = await downloadFile(filename);

	// Заголовки для скачивания файла
	res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
	res.setHeader('Content-Type', s3Response.ContentType ?? 'application/octet-stream');
	
	// Если известен размер, установить его заголовок для указания процента загрузки, проверка целостности загрузки и возможности докачки 
	if (s3Response.ContentLength) {
		res.setHeader("Content-Length", s3Response.ContentLength.toString());
	}
	// Для поддержки докачки
	res.setHeader('Accept-Ranges', 'bytes');

	(s3Response.Body as NodeJS.ReadableStream)
		.pipe(res);
});

app.get('/files/download/all/:id', async (req: Request<unknown, unknown, unknown, { id: string }>, res: Response) => {
	const caseId: string = req.query.id;
	const mergedFile: GetObjectCommandOutput = await mergeFiles(caseId);

	res.setHeader('Content-Disposition', `attachment; filename="mergedFiles.pdf"`);
	res.setHeader('Content-Type', mergedFile.ContentType ?? 'application/octet-stream');
	
	if (mergedFile.ContentLength) {
		res.setHeader("Content-Length", mergedFile.ContentLength.toString());
	}

	res.setHeader('Accept-Ranges', 'bytes');

	(mergedFile.Body as NodeJS.ReadableStream)
		.pipe(res);
});

export { app };
