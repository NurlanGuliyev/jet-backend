import axios from 'axios';
import dotenv from 'dotenv';
import { getFile } from './file.js';
import jwt from 'jsonwebtoken';
import { routes } from '../constants.js';
import { userData } from '../index.js';

dotenv.config();

const AMENITIES_FILE = './data/amenities.json';

const SALES_STATUS_FILE = './data/sale-status.json';

const CONSTRUCTION_STATUS_FILE = './data/construction-status.json';

const PROJECT_TYPE_FILE = './data/project-type.json';

export const extractFilters = async (wantedAmenities, userToken) => {
	const pushSessionFields = (list, wantedList, key) => {
		const nameSet = new Set(list.map(({ name }) => name.toLowerCase()));

		wantedList.forEach((wantedName) => {
			if (wantedName.includes('|')) {
				const [firstPart, secondPart] = wantedName
					.split('|')
					.map((part) => part.toLowerCase());

				const bothExist = nameSet.has(firstPart) && nameSet.has(secondPart);

				if (bothExist) {
					//key = key.filter(item => item.toLowerCase() !== firstPart && item.toLowerCase() !== secondPart);
					if (!key.includes(wantedName)) {
						key.push(wantedName);
					}
				}
			} else if (nameSet.has(wantedName.toLowerCase()) && !key.includes(wantedName)) {
				key.push(wantedName);
			}
		});
	};

	const amenities = getFile(AMENITIES_FILE);

	const saleStatus = getFile(SALES_STATUS_FILE);

	const constructionStatus = getFile(CONSTRUCTION_STATUS_FILE);

	const projectTypes = getFile(PROJECT_TYPE_FILE);

	pushSessionFields(
		amenities,
		wantedAmenities,
		userData[userToken].property.filters.tax_amenities
	);

	pushSessionFields(
		saleStatus,
		wantedAmenities,
		userData[userToken].property.filters.tax_sale_status
	);

	pushSessionFields(
		constructionStatus,
		wantedAmenities,
		userData[userToken].property.filters.tax_construction_status
	);

	pushSessionFields(
		projectTypes,
		wantedAmenities,
		userData[userToken].property.filters.tax_project_types
	);

	return userData[userToken].property.filters;
};

export const filterAmenityNames = (completionText) => {
	const regex = /\d+\>\s*([A-Za-z0-9\s\-/&.'",:;|]+)\n/gim;

	const metaRegex = /meta_\w+(?:=>=|=<=|==|=<|=>|=)([\s\S]*?)\d*\n/gm;

	completionText = String(completionText);

	let matches = completionText.matchAll(regex);

	let metaMatches = completionText.match(metaRegex) || [];

	const amenityNames = [];

	const metaNames = [];

	for (const match of matches) {
		amenityNames.push(match[1].trim());
	}

	metaMatches.forEach((metaMatch) => {
		if (!metaNames.includes(metaMatch.trim())) metaNames.push(metaMatch.trim());
	});

	return { amenityNames, metaNames };
};

export const isEnoughInfoCollected = (userToken, metaNames) =>
	userData[userToken].property.filters.tax_amenities.length > 0 ||
	userData[userToken].property.filters.tax_sale_status.length > 0 ||
	userData[userToken].property.filters.tax_construction_status > 0 ||
	userData[userToken].property.filters.tax_project_types.length > 0 ||
	metaNames.length > 0;

export const fetchProperties = async (filters, metas) => {
	let url = 'https://metarealtyinc.ca/wp-json/wep-crawler/v1/projects?';

	if (filters.tax_amenities.length > 0)
		url += `tax_amenities=${filters.tax_amenities.join(',')}&`;

	if (filters.tax_sale_status.length > 0)
		url += `tax_sale-status=${filters.tax_sale_status.join(',')}&`;

	if (filters.tax_construction_status.length > 0)
		url += `tax_construction-status=${filters.tax_construction_status.join(',')}&`;

	if (filters.tax_project_types.length > 0)
		url += `tax_project-type=${filters.tax_project_types.join(',')}&`;

	if (metas.length > 0) url += `${metas.join('&')}&`;

	url = url.slice(0, -1);

	console.log('Fetch URL:', url);

	const token = jwt.sign({}, process.env.SECRET_KEY, { algorithm: 'HS256' });

	try {
		const { data } = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return data;
	} catch (error) {
		console.error('Error fetching properties:', error);

		return [];
	}
};

export const getCompletionText = async (content, messages) => {
	const { data } = await axios.post(
		routes.sendMessage,
		{
			model: 'gpt-4o',
			messages: [{ role: 'system', content: content }, ...messages],
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
		}
	);

	let completionText = data.choices[0].message.content;

	return completionText;
};
