import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';

import { Case } from './types';
import { CASE_DB_PATH, INDEX_JSON } from '../../config/config';

async function createCase(title: string): Promise<Case> {
	const caseData: Case = {
		title: title,
		id: uuidv4(),
		filesList: [],
	};
	
	// путь к новому json-файлу 
	const caseFilePath = path.join(process.cwd(), CASE_DB_PATH, `${caseData.id}.json`); // Добавить проверку дубликатов имен

	await writeFile(caseFilePath, JSON.stringify(caseData, null, 4), 'utf-8');

	// путь к индексному файлу, который объединяет данные всех json-файлов
	const indexJsonPath = path.join(process.cwd(), CASE_DB_PATH, INDEX_JSON);

	// Если база данных пустая, создается новый пустой индексный файл
	try {
		await readFile(indexJsonPath, 'utf-8')
	} catch {
		await writeFile(indexJsonPath, '', 'utf-8');
	}

	// если в индексном файле пусто, то в него присваивается пустой массив
	const indexFile = await readFile(indexJsonPath, 'utf-8');
	const indexJson: Case[] = indexFile ? JSON.parse(indexFile) : [];

	indexJson.push(caseData);

	await writeFile(indexJsonPath, JSON.stringify(indexJson, null, 4), 'utf-8');

	return caseData; // возвращает данные кейса
}

export { createCase };
