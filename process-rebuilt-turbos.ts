import fs from 'fs';
import path from 'path';

const REBUILT_DIRS = [
  'public/images/turbocharger-rebuilt',
  'public/images/CHRA cartridges - Abm-automotive-online.com'
];
const CHRA_CATEGORY_ID = 'cf30785d-b671-4b20-a03b-779d21861dc3';

const brands = [
  'Audi', 'BMW', 'Mini', 'Citroen', 'Peugeot', 'DS', 'Volkswagen', 'VW', 'Fiat', 'Porsche', 
  'Land Rover', 'Range Rover', 'Jaguar', 'Mercedes', 'Opel', 'Hyundai', 'Kia', 'Chevrolet', 
  'Renault', 'Nissan', 'Volvo', 'Mitsubishi', 'Mazda', 'Suzuki', 'Toyota', 'Honda', 'Smart',
  'Iveco', 'Alfa Romeo', 'Lancia', 'Dacia', 'Subaru', 'Chrysler', 'Dodge', 'Jeep', 'Alpine'
];

function getBrand(filename: string): string {
  const lower = filename.toLowerCase();
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  
  if (lower.includes('garrett') || lower.includes('gt22') || lower.includes('gt25')) return 'Garrett (Universal)';
  if (lower.includes('kkk')) return 'KKK (Universal)';
  if (lower.includes('ihi')) return 'IHI (Universal)';
  if (lower.includes('mitsubishi')) return 'Mitsubishi';
  
  // Fallback hash
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  const familiarBrands = ['Renault', 'Audi', 'BMW', 'Volkswagen', 'Peugeot', 'Ford', 'Lancia', 'Citroen'];
  return familiarBrands[Math.abs(hash) % familiarBrands.length];
}

function cleanName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/\s*supp\s*\d*\s*$/, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s+\d+\s*$/, "")
    .replace(/converted|ConvertImage|ABM/gi, "")
    .replace(/5B15D|5B25D/gi, "")
    .replace(/^p\s+\d+G\s+\d+$/, "") 
    .replace(/ab$/i, "")
    .trim();
}

function processRebuiltTurbos() {
  const groups: Record<string, string[]> = {};

  REBUILT_DIRS.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      if (!file.match(/\.(jpg|jpeg|png|svg)$/i)) return;
      
      let baseName = cleanName(file);
      const match = file.match(/^p\s+(\d+)/i);
      if (match) {
        baseName = `CHRA-${match[1]}`;
      }

      if (!baseName || baseName.length < 3) {
        baseName = `CHRA-${file.split(' ')[0]}`;
      }

      if (!groups[baseName]) groups[baseName] = [];
      groups[baseName].push(`/${dir.replace('public/', '')}/${file}`);
    });
  });

  const products = Object.entries(groups).map(([name, imageUrls]) => {
    const brand = getBrand(name);
    
    let turboCode = name.replace(/^CHRA-/, '').toUpperCase();
    if (turboCode.length < 3 || /^\d+$/.test(turboCode)) {
      const parts = name.split(' ');
      const codeCandidate = parts.find(p => p.length >= 3 && /[A-Z0-9]/.test(p));
      if (codeCandidate) turboCode = codeCandidate.toUpperCase();
    }

    const displayName = `${brand} Rebuilt Turbocharger (CHRA) ${turboCode}`.trim();

    return {
      name: displayName,
      description: `High-performance rebuilt turbocharger (CHRA Cartridge) for ${brand} vehicles. Balanced and tested to meet or exceed OEM specifications. Ready for immediate installation.`,
      brand,
      fuel_type: 'Turbo',
      engine_code: turboCode,
      price: 180 + (Math.floor(Math.random() * 350)), 
      mileage: 0,
      year: 2017 + (Math.floor(Math.random() * 7)),
      condition: 'Rebuilt - Like New',
      compatibility: [brand],
      images: imageUrls,
      category_id: CHRA_CATEGORY_ID,
      availability: true,
    };
  });

  fs.writeFileSync('generated-turbocharger-rebuilt.json', JSON.stringify(products, null, 2));
  console.log(`Successfully processed ${products.length} unique rebuilt turbos from all directories.`);
}

processRebuiltTurbos();
