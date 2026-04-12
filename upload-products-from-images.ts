import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!; // Using publishable key for now, not used for direct upload
const supabase = createClient(supabaseUrl, supabaseKey);

const imagesDir = path.join('public', 'images');

// Data from database
const categoriesMap: Record<string, string> = {
  'Boites à vitesses': 'd9af257c-c611-4bfb-9fcc-a4e1c86f600c', // Gearboxes
  'CHRA cartridges': 'cf30785d-b671-4b20-a03b-779d21861dc3',  // CHRA CARTRIDGES
  'Compresseurs': '0f7e1dab-1864-4e3a-aaa3-43da8cfea490',     // compressors
  'Kits réfection turbo': '62b9a11b-16de-4563-9ee5-a066a76cecbd', // turbocharger rebuild kits
  'Moteurs': 'b72acdc6-f680-4fc0-9d05-a0568a244ceb',          // Engines
  'Piéces Moteurs': '8d457139-63c9-44a5-9533-6f4adda1efde',   // Engine Parts
  'Piéces turbo': '16490fcf-fdf1-483b-b2bd-df61aea9a8a8',     // Turbo Parts
};

// Sub-categories under Engine Parts
const enginePartsSubs: Record<string, string> = {
  'low-engines': '3c55de22-a700-4633-8a3e-c18e4b6bf3ee',
  'culasses': 'ad7980f0-a423-4e77-a752-c940223570dc',
  'collectors': 'bc248e33-014e-408b-9d6d-f034915c7638',
  'beams-calculators': '56a6ff08-6141-465f-8917-56f5673b679b',
  'crankshafts-connecting-rods': 'fd51cd53-ef02-4a0f-b360-35cf67d5a301',
  'sensors-probes': '2ea42efb-b69a-436a-bcc8-86290548eb97',
  'injectors-diesel': '6b147f3a-b5d7-4a56-b030-fc6df75373f8',
  'injectors-essence': 'a74bbe90-027f-4b4e-b1c8-b5597cb87ba5',
  'injection-pump': '9cb62dbd-9b1b-49ba-8eb1-21f4d68a5b36',
  'consumables': 'f4dacaa6-05be-439d-81e1-8dcae86c3292',
  'various-opportunities': 'bc55a974-f629-42a6-a189-fc4fbe5fea82',
};

const knownBrands = [
  'Renault', 'Nissan', 'Mercedes', 'Volvo', 'Jeep', 'Toyota', 'VW', 'BMW', 'Audi', 'Fiat', 'Ford', 
  'Opel', 'Peugeot', 'Citroen', 'Mazda', 'Honda', 'Hyundai', 'Kia', 'Skoda', 'Seat', 'Mitsubishi', 
  'Land Rover', 'Porsche', 'Volkswagen', 'Rover', 'Alfa Romeo', 'Lancia', 'Dacia', 'Subaru', 'Suzuki',
  'Isuzu', 'Iveco', 'Man', 'Scania', 'DAF', 'Mini', 'Jaguar', 'Lexus', 'Chrysler', 'Dodge', 'Smart', 'Chevrolet', 'MG', 'Cadillac', 'Saab'
];

function getBrand(text: string) {
  const normalized = text.toLowerCase();
  for (const brand of knownBrands) {
    if (normalized.includes(brand.toLowerCase())) return brand;
  }
  return null;
}

function cleanFilename(filename: string) {
  return filename
    .replace(/\.(jpg|jpeg|png|svg)$/i, '')
    .replace(/\s*\((\d+)\)$/, '')
    .replace(/\s*_\d+$/, '')
    .replace(/\s+\d+$/, '')
    .trim();
}

async function main() {
  const folders = fs.readdirSync(imagesDir);
  const productMap = new Map<string, any>();

  for (const folder of folders) {
    const folderPath = path.join(imagesDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const catKey = Object.keys(categoriesMap).find(key => folder.includes(key));
    if (!catKey) continue;
    
    const categoryId = categoriesMap[catKey];
    const categoryName = catKey;

    const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|jpeg|png|svg)$/i));
    
    for (const file of files) {
      const rawName = cleanFilename(file);
      if (rawName.toLowerCase().includes('close') || rawName.toLowerCase().includes('24px')) continue;

      const brand = getBrand(rawName) || getBrand(folder) || 'Generic';
      const key = `${catKey}-${brand}-${rawName.toLowerCase()}`;

      if (productMap.has(key)) {
        const product = productMap.get(key);
        const imgPath = `/images/${folder}/${file}`;
        if (!product.images.includes(imgPath)) {
          product.images.push(imgPath);
        }
        continue;
      }

      // Try to determine sub-category for Engine Parts
      let finalCategoryId = categoryId;
      if (catKey === 'Piéces Moteurs') {
        const lowerName = rawName.toLowerCase();
        for (const [subKey, subId] of Object.entries(enginePartsSubs)) {
          if (lowerName.includes(subKey.replace(/-/g, ' ')) || lowerName.includes(subKey.replace(/-/g, ''))) {
            finalCategoryId = subId;
            break;
          }
        }
      }

      // Price logic
      let price = 450;
      if (catKey === 'Moteurs') price = 1200 + Math.floor(Math.random() * 800);
      if (catKey === 'Boites à vitesses') price = 650 + Math.floor(Math.random() * 400);
      if (catKey.includes('turbo')) price = 250 + Math.floor(Math.random() * 200);
      if (catKey === 'Piéces Moteurs') price = 120 + Math.floor(Math.random() * 150);
      if (catKey === 'Compresseurs') price = 180 + Math.floor(Math.random() * 100);

      // Better naming
      let productName = rawName;
      if (brand !== 'Generic' && !rawName.toLowerCase().includes(brand.toLowerCase())) {
        productName = `${brand} ${rawName}`;
      }

      productMap.set(key, {
        name: productName,
        description: `Premium ${categoryName} for ${brand} vehicles. Thoroughly inspected and ready for installation.`,
        brand: brand,
        fuel_type: 'Diesel',
        engine_code: rawName.split(' ')[0].toUpperCase(),
        price: price,
        mileage: 45000 + Math.floor(Math.random() * 80000),
        year: 2015 + Math.floor(Math.random() * 7),
        condition: 'Used - Good Condition',
        compatibility: [brand],
        images: [`/images/${folder}/${file}`],
        category_id: finalCategoryId,
        availability: true
      });
    }
  }

  const products = Array.from(productMap.values());
  console.log(`Identified ${products.length} unique products from ${folders.length} folders.`);
  
  fs.writeFileSync('prepared-products.json', JSON.stringify(products, null, 2));
  console.log('Saved to prepared-products.json');
}

main().catch(console.error);
