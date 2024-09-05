import cors from 'cors';
import express from 'express';
import fs from 'fs';
import { getFileContentNames } from './file.js';
import { getPrompt } from '../database/repository/prompt.js';

const AMENITIES_FILE = './data/amenities.json';

const SALES_STATUS_FILE = './data/sale-status.json';

const CONSTRUCTION_STATUS_FILE = './data/construction-status.json';

const PROJECT_TYPE_FILE = './data/project-type.json';

const app = express();

app.use(cors());

app.use(express.json());

export const constructPrompt = () => {
	const knownAmenities = getFileContentNames(AMENITIES_FILE);

	const knownSalesStatus = getFileContentNames(SALES_STATUS_FILE);

	const knownConstructionStatus = getFileContentNames(CONSTRUCTION_STATUS_FILE);

	const knownProjectTypes = getFileContentNames(PROJECT_TYPE_FILE);

	const content = fs.readFileSync('./data/instructions.txt', { encoding: 'utf8', flag: 'r' });

	return content;
};

export const getContent = async () => {
	const content = await getPrompt();

	return content || '';
};

export const updateContent = async ( ) => {

	if (typeof newContent !== 'string') {
		return res.status(400).json({ error: 'Invalid content format. It should be a string.' });
	}

	try {
		fs.writeFileSync('./data/instructions.txt', newContent, 'utf8');

		res.json({ message: 'Content updated successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update the file.' });
	}
};

/*
app.post('/api/updateContent', (req, res) => {
    const { newContent } = req.body;

    if (typeof newContent !== 'string') {
        return res.status(400).json({ error: 'Invalid content format. It should be a string.' });
    }

    try {
        fs.writeFileSync(path.resolve('./data/instructions.txt'), newContent, 'utf8');
        // Optionally, you could update a global variable or cache here if needed
        res.json({ message: 'Content updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update the file.' });
    }
});
*/

export const constructPrompt2 = (propertyCount = null, propertyLinks = [], previousMessage) => {
	let content2 = `
        Provide detailed property information and answer specific questions to deliver value effectively.
        Maintain a friendly, professional, and helpful tone throughout interactions.
        Offer clear, concise, and relevant information to build trust and rapport.
        Aim for a seamless and positive user experience in every interaction.
        Avoid using exaggerated words, and speak with minimal verbiage like a business professional.
        Ensure your responses sound human, with less robotic phrasing. People talk to you should think you are a human being.  
    
        You need to know how many houses are left according to the features requested by the user and give appropriate answers accordingly.
    
        This is your previous message for you to understand what features the user wants : ${previousMessage}. 

        This is property numbers based on the user needs and filters: ${propertyCount}.
        User can still ask you about the property features after you send the link or say that they do not like the house etc. behave like an agent when talking.

        Do not ask if they would like to know more about one of these properties.
    `;

	if (propertyCount !== null) {
		if (propertyCount === 0) {
			content2 += `
                There are no properties that match the user's criteria, say user there are no properties match their criteria. And ask for them to provide different criteria or you can ask if they can increase the budget a little if they have already set a budget or give up some features.
            `;
		} else if (propertyCount > 6) {
			content2 += `
                There are still more properties, say that there are still many properties that match their criteria. And ask for them to provide more specific preferences to narrow down the options, do not say that you will start looking for it.
            `;
		} else {
			content2 += `
                There are decent number of properties, show the user these properties' links. do not show them in () or [].
                ${propertyLinks.join('\n')}
            `;
		}
	}

	return content2;
};
