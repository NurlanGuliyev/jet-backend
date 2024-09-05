import fs from 'fs';
import path from 'path';

export const getFile = (fileName) => {
	const data = JSON.parse(fs.readFileSync(fileName, 'utf8'));

	return data;
};

export const getFileContentNames = (fileName) => {
	const data = getFile(fileName);

	const results = data.map((item) => item.name).join(', ');

	return results;
};

export const readFile = (filePath) =>
	fs.readFileSync(path.resolve(process.cwd(), filePath), {
		encoding: 'utf8',
		flag: 'r',
	});

export const readJsonFile = (filePath) =>
	JSON.parse(
		fs.readFileSync(path.resolve(process.cwd(), filePath), {
			encoding: 'utf8',
			flag: 'r',
		})
	);
