import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { app } from './app';
import { config } from './config/config';

const s3Client = new S3Client({
	region: 'ru-central1',
	endpoint: 'https://storage.yandexcloud.net',
	credentials: {
		accessKeyId: process.env.KEY_ID ?? '',
		secretAccessKey: process.env.SECRET_KEY ?? '',
	},
});

app.listen(config.port, () => {
	console.log(`Server running on port ${config.port}`);
});

export { s3Client };
