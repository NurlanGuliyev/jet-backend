import Prompt from '../modals/Prompt.js';
import { readFile } from '../../helper/file.js';

export const getPrompt = async () => {
	const prompts = await Prompt.find({});

	return prompts.length > 0 ? prompts[0] : null;
};

export const createPrompt = async () => {
	const prompt = await getPrompt();

	if (prompt) return prompt;

	const content = readFile('data/instructions.txt');

	const data = await Prompt.create({
		content,
	});

	return data;
};

export const updatePrompt = async (content) => {
	if (!content) throw new Error('Content missing');

	const data = await Prompt.findOneAndUpdate({}, { content });

	return data;
};

export const resetPrompt = async () => {
	if (!content) throw new Error('Content missing');

	const content = readFile('data/instructions.txt');

	const data = await Prompt.findOneAndUpdate({}, { content });

	return data;
};
