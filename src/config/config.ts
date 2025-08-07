import dotenv from 'dotenv';

dotenv.config();

type Config = {
	port: number;
	nodeEnv: string;
};

const config: Config = {
	port: Number(process.env.PORT) || 3000,
	nodeEnv: process.env.NODE_ENV || 'development',
};

const CASE_DB_PATH: string = '/caseDB';
const INDEX_JSON: string = 'index.json';
const BUCKET: string = 'casefiles-storage';


export { config, CASE_DB_PATH, BUCKET, INDEX_JSON };
