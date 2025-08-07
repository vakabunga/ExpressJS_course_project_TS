type Case = {
	title: string;
	id: string;
	uploadedFiles: number;
	filelist?: string[];
};

type NewCase = {
	title: string;
};

export { Case, NewCase };
