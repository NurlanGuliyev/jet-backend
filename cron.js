import axios from 'axios'; 

import fs from 'fs';

import { routes } from './constants.js';

const AMENITIES_FILE = '../data/amenities.json';

const PAGE_SIZE = 100;

export const seedAmenities = async () => {
    let amenities = [];

    let page = 1;

    while (true) {
      let url = routes.amenities.replace('<PAGE_SIZE>', PAGE_SIZE).replace('<page>', page);
      
      const { data } = await axios.get(url);

      if (data.length === 0) break;

      const amenityNames = data.map(amenity => ({ name: amenity.name }));

      amenities = [...amenities, ...amenityNames];
      
      page++;
    }
  
    fs.writeFileSync(AMENITIES_FILE, JSON.stringify(amenities, null, 2));

    console.log('Amenities updated.');
};