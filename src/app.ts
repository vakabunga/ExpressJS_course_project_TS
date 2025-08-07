import express, { Request, response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';

import { getCasesList } from './models/cases/list';
import { createCase } from './models/cases/create';
import { NewCase } from './models/cases/types';
import { uploadFile } from './models/files/upload';

const app = express();

app.use(express.json());

app.get('/ping', (req, res) => {
	res.send('pong');
});

app.get('/case/list', async (req, res) => {
	const casesList = await getCasesList();

	res.send(casesList);
});

app.post('/case/create', async (req: Request<unknown, unknown, NewCase>, res) => {
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

	const response = await uploadFile(req.params.id, req.files);

	res.send(response);
});

export { app };
