import { GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';

import { BUCKET } from '../../config/config';
import { s3Client } from '../../server';

async function downloadFile(filename: string): Promise<GetObjectCommandOutput> {
	const command = new GetObjectCommand({
		Bucket: BUCKET,
		Key: filename,
	});

	return await s3Client.send(command);
}

export { downloadFile };
