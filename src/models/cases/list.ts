import { readFile } from 'fs/promises';
import path from 'path';

import { CASE_DB_PATH, INDEX_JSON } from '../../config/config';

// Получаем список кейсов
async function getCasesList(): Promise<string[]> {
	const indexJson = await readFile(path.join(process.cwd(), CASE_DB_PATH, INDEX_JSON), 'utf-8');

	const casesList = JSON.parse(indexJson);

	return casesList;
}

export { getCasesList };
