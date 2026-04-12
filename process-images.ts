import fs from 'fs';
import path from 'path';

const categoriesMap: Record<string, string> = {
  'Boites à vitesses': 'd9af257c-c611-4bfb-9fcc-a4e1c86f600c', // Gearboxes
  'CHRA cartridges': 'cf30785d-b671-4b20-a03b-779d21861dc3',  // CHRA CARTRIDGES
  'Compresseurs': '0f7e1dab-1864-4e3a-aaa3-43da8cfea490',     // compressors
  'Kits réfection turbo': '62b9a11b-16de-4563-9ee5-a066a76cecbd', // turbocharger rebuild kits
  'Moteurs': 'b72acdc6-f680-4fc0-9d05-a0568a244ceb',          // Engines
  'Piéces Moteurs': '8d457139-63c9-44a5-9533-6f4adda1efde',   // Engine Parts
  'Piéces turbo': '16490fcf-fdf1-483b-b2bd-df61aea9a8a8',     // Turbo Parts
  'engines': 'b72acdc6-f680-4fc0-9d05-a0568a244ceb',          // Engines
};

const categoryDisplayNames: Record<string, string> = {
  'Boites à vitesses': 'Gearboxes',
  'CHRA cartridges': 'CHRA Cartridges',
  'Compresseurs': 'Compressors',
  'Kits réfection turbo': 'Turbo Rebuild Kits',
  'Moteurs': 'Engines',
  'Piéces Moteurs': 'Engine Parts',
  'Piéces turbo': 'Turbo Parts',
  'engines': 'Engines',
};

const brands = [
  'Renault', 'Nissan', 'Mercedes', 'Volvo', 'Jeep', 'Toyota', 'VW', 'BMW', 'Audi', 'Fiat', 'Ford', 
  'Opel', 'Peugeot', 'Citroen', 'Mazda', 'Honda', 'Hyundai', 'Kia', 'Skoda', 'Seat', 'Mitsubishi', 
  'Land Rover', 'Porsche', 'Volkswagen', 'Rover', 'Alfa Romeo', 'Lancia', 'Dacia', 'Subaru', 'Suzuki',
  'Isuzu', 'Iveco', 'Man', 'Scania', 'DAF', 'Mini', 'Jaguar', 'Lexus', 'Chrysler', 'Dodge', 'Smart'
];

const imagesDir = path.join('public', 'images');

function getBrand(text: string) {
  const normalized = text.toLowerCase();
  for (const brand of brands) {
    if (normalized.includes(brand.toLowerCase())) return brand;
  }
  return null;
}

// Simple hash function to generate consistent random-like numbers from a string
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateEngineCode(hash: number) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l1 = letters[hash % 26];
  const l2 = letters[(hash >> 2) % 26];
  const n1 = (hash % 90) + 10;
  return `${l1}${l2}${n1}`;
}

function processImages() {
  const products: any[] = [];
  const folders = fs.readdirSync(imagesDir);

  for (const folder of folders) {
    const folderPath = path.join(imagesDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const categoryIdKey = Object.keys(categoriesMap).find(key => folder.includes(key));
    if (!categoryIdKey) continue;
    
    const categoryName = categoryDisplayNames[categoryIdKey] || 'Parts';

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png|svg)$/i)) continue;
      
      const nameWithoutExt = file.replace(/\.[^/.]+$/, '').trim();
      const imageUrl = `/images/${folder}/${file}`;
      
      const fileHash = hashString(nameWithoutExt);
      
      // Try to get brand from filename or folder, otherwise fallback to a pseudo-random familiar brand based on hash
      let brand = getBrand(nameWithoutExt) || getBrand(folder);
      if (!brand) {
        brand = brands[fileHash % brands.length];
      }
      
      const fuelType = nameWithoutExt.toLowerCase().includes('tdi') || nameWithoutExt.toLowerCase().includes('dci') || nameWithoutExt.toLowerCase().includes('hdi') ? 'Diesel' : 'Petrol';
      
      // Better engine code logic
      let engineCode = nameWithoutExt.split(' ')[0];
      const lowerEngine = engineCode.toLowerCase();
      if (lowerEngine.startsWith('img') || lowerEngine.startsWith('dsc') || lowerEngine.startsWith('screenshot') || lowerEngine === 'generic' || engineCode.length < 3) {
        engineCode = generateEngineCode(fileHash);
      } else {
        engineCode = engineCode.toUpperCase();
      }

      // Professional name logic instead of generic IMG names
      let displayName = nameWithoutExt;
      const lowerDisplay = displayName.toLowerCase();
      if (lowerDisplay.startsWith('img') || lowerDisplay.startsWith('dsc') || lowerDisplay.startsWith('screenshot') || lowerDisplay.includes('convert') || displayName.length < 5) {
        // Construct a nice name like "Toyota Moteurs XT45"
        displayName = `${brand} ${categoryName} ${engineCode}`;
      } else {
        // Just ensure brand is in the name
        if (!lowerDisplay.includes(brand.toLowerCase())) {
          displayName = `${brand} ${displayName}`;
        }
      }

      products.push({
        name: displayName,
        description: `High quality ${categoryName} for ${brand} vehicles. Thoroughly inspected, tested and ready for installation.`,
        brand,
        fuel_type: fuelType,
        engine_code: engineCode,
        price: Math.floor(20 + (fileHash % 1980)), // 20 to 2000
        mileage: Math.floor(fileHash % 150000),
        year: 2010 + (fileHash % 15), // 2010 to 2024
        condition: 'Used - Excellent',
        compatibility: [brand],
        images: [imageUrl],
        category_id: categoriesMap[categoryIdKey],
        availability: true,
      });
    }
  }

  return products;
}

const products = processImages();
fs.writeFileSync('generated-products.json', JSON.stringify(products, null, 2));
console.log(`Generated ${products.length} products.`);
