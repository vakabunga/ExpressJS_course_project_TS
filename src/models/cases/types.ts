// Тип для кейса (имя; id; список загруженных файлов к этому кейсу; имя объединенного файла пдф, если есть)
type Case = {
	title: string;
	id: string;
	filesList: string[];
	merged?: string;
};

export { Case };
