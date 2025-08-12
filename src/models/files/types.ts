import { Case } from "../cases/types";

type Message = {
	type: 'warning' | 'error';
	message: string;
	error?: unknown;
};

type DataForHTMLConvert = {
	caseId: string;
	fileName: string;
	htmlData: string;
	messages: Message[];
};

type ResultWithFile = {
	status: number;
	message: string;
	data?: Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike>;
};

type ResultWithCase = {
	status: number;
	message: string;
	data?: Case;
}

export { DataForHTMLConvert, ResultWithFile, ResultWithCase };
