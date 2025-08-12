import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ResultWithCase } from './types';
import { Case } from '../cases/types';

import { CASE_DB_PATH } from '../../config/config';

// Функция добавления данных о загруженном файле в json файл кейса
async function addFilesToCase(caseId: string, filename: string): Promise<ResultWithCase> {
	const filePath = path.join(process.cwd(), CASE_DB_PATH, `${caseId}.json`);
	const caseJson: Case = JSON.parse(await readFile(filePath, 'utf-8'));

	caseJson.filesList.push(`${filename}.pdf`); // Добавить проверку исключающую повторную загрузку файлов на сервер

	await writeFile(filePath, JSON.stringify(caseJson, null, 4), 'utf-8');

	// Проверка наличия объединенного файла. если объединение было - удалить информацию, как неактуальную
	if (caseJson.merged) {
		caseJson.merged = undefined;
	}

	return {
		status: 200,
		message: 'The file added to the case successfully',
		data: caseJson,
	};
}

export { addFilesToCase };
