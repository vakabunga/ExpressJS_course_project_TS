import mammoth from 'mammoth';
import puppeteer from 'puppeteer';

import { addFilesToCase } from './addFilesToCase';

import { DataForHTMLConvert, FunctionResult } from './types';

async function convertToPdf(caseId: string, filename: string, file: Buffer<ArrayBufferLike>): Promise<FunctionResult> {
	const dataForHTMLConvert = await convertToHTML(caseId, filename, file);

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	page.setContent(dataForHTMLConvert.htmlData, { waitUntil: 'domcontentloaded' });

	const pdfBuffer = await page.pdf();

	await browser.close();

	const response =
		(await addFilesToCase(caseId, filename)).status !== 200
			? { status: 400, message: 'try again later' }
			: { status: 200, message: 'PDF was created successfully' };

	return { ...response, data: pdfBuffer };
}

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
