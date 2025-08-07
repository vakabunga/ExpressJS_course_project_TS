import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { FunctionResult } from './types';
import { Case } from '../cases/types';

import { CASE_DB_PATH } from '../../config/config';

async function addFilesToCase(caseId: string, filename: string): Promise<FunctionResult> {
	const filePath = path.join(process.cwd(), CASE_DB_PATH, `${caseId}.json`);
	const caseJson: Case = JSON.parse(await readFile(filePath, 'utf-8'));

	if (!caseJson.filelist) {
		caseJson.filelist = [];
	}

	caseJson.filelist.push(`${filename}.pdf`); // Добавить проверку исключающую повторную загрузку файлов на сервер
	caseJson.uploadedFiles++;

	await writeFile(filePath, JSON.stringify(caseJson, null, 4), 'utf-8');

	return {
		status: 200,
		message: 'The file added to the case successfully',
	};
}

export { addFilesToCase };
