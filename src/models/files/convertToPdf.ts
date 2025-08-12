import mammoth from 'mammoth';
import puppeteer from 'puppeteer';

import { DataForHTMLConvert, ResultWithFile } from './types';

async function convertToPdf(caseId: string, filename: string, file: Buffer<ArrayBufferLike>): Promise<ResultWithFile> {
	
	// конвертируем docx в html (найти вариант конвертации в html вместе со стилями)
	const dataForHTMLConvert = await convertToHTML(caseId, filename, file);

	// результат конвертируем в pdf
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	page.setContent(dataForHTMLConvert.htmlData, { waitUntil: 'domcontentloaded' });

	const pdfBuffer = await page.pdf();

	await browser.close();

	return {
		status: 200,
		message: 'PDF was created successfully',
		data: pdfBuffer,
	};
}

// функция конвертации в html
async function convertToHTML(caseId: string, filename: string, file: Buffer<ArrayBufferLike>): Promise<DataForHTMLConvert> {
	const result = await mammoth.convertToHtml({ buffer: file });
	const htmlData = result.value;
	const messages = result.messages;

	return {
		caseId: caseId,
		fileName: filename,
		htmlData: htmlData,
		messages: messages,
	};
}

export { convertToPdf };
