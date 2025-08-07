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

type FunctionResult = {
	status: number;
	message: string;
	data?: Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike>;
};

export { DataForHTMLConvert, FunctionResult };
