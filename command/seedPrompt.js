import connectDB from '../database/connectDB.js';
import { createPrompt } from '../database/repository/prompt.js';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
	console.log('Starting prompt seed'.green);

	await connectDB();

	await createPrompt();

	console.log('Seeded prompt'.green);

	process.exit();
};

start();
