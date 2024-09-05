import { constructPrompt, constructPrompt2 } from './helper/prompt.js';
import {
	extractFilters,
	fetchProperties,
	filterAmenityNames,
	getCompletionText,
	isEnoughInfoCollected,
} from './helper/amenity.js';
import { getPrompt, updatePrompt } from './database/repository/prompt.js';

import connectDB from './database/connectDB.js';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import express from 'express';
import { seedAmenities } from './cron.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

cron.schedule('0 2 * * 2,5', seedAmenities);

app.get('/api/content', async (req, res) => {
	try {
		const prompt = await getPrompt();

		return res.status(200).json({ prompt: prompt?.content || '' });
	} catch (err) {
		return res.status(500).json({ error: 'Internal server error.' });
	}
});

app.put('/api/content', async (req, res) => {
	try {
		const { content } = req.body;

		const prompt = await updatePrompt(content);

		return res.status(200).json({ prompt: prompt?.content || '' });
	} catch (err) {
		return res.status(500).json({ error: 'Internal server error.' });
	}
});

export let userData = {};

app.post('/chat', async (req, res) => {
	const { messages, userToken } = req.body;

	console.log('user token: ', userToken);

	if (!userData[userToken]) {
		userData[userToken] = {
			property: {
				number: '',
				link: [],
				filters: {
					tax_amenities: [],
					tax_sale_status: [],
					tax_construction_status: [],
					tax_project_types: [],
				},
			},
		};
	}

	const content = constructPrompt();

	console.log('\nuser message : ', messages[messages.length - 1].content);

	try {
		const completionText = await getCompletionText(content, messages);

		console.log('\nbot 1 msg: ', completionText);

		const { amenityNames, metaNames } = filterAmenityNames(completionText);

		userData[userToken].property.filters = await extractFilters(amenityNames, userToken);

		if (!isEnoughInfoCollected(userToken, metaNames)) {
			return res.json({ response: completionText });
		}

		console.log('\namenities :', amenityNames);

		console.log('\nmetas :', metaNames);

		const properties = await fetchProperties(userData[userToken].property.filters, metaNames);

		userData[userToken].property.number = properties.length;

		userData[userToken].property.link = properties.map((p) => p.guid);

		console.log(
			'\nproperty num&link: ',
			userData[userToken].property.number,
			userData[userToken].property.link
		);

		const updatedContent = constructPrompt2(
			userData[userToken].property.number,
			userData[userToken].property.link,
			completionText
		);

		const updatedCompletionText = await getCompletionText(updatedContent, messages);

		console.log('\nbot 2 msg: ', updatedCompletionText);

		userData[userToken].property.filters = {
			tax_amenities: [],
			tax_sale_status: [],
			tax_construction_status: [],
			tax_project_types: [],
		};

		return res.json({ response: updatedCompletionText });
	} catch (error) {
		console.error('Error:', error);

		return res.status(500).json({ error: 'Failed to communicate with OpenAI API' });
	}
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
