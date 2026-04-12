import fs from 'fs';
import path from 'path';

const TURBO_DIR = 'public/images/turbokits';
const TURBO_KITS_CATEGORY_ID = '62b9a11b-16de-4563-9ee5-a066a76cecbd';

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
  
  if (lower.includes('garrett')) return 'Garrett (Universal)';
  if (lower.includes('kkk')) return 'KKK (Universal)';
  if (lower.includes('mitsubishi')) return 'Mitsubishi';
  if (lower.includes('holset')) return 'Holset';
  
  // Fallback hash
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  const familiarBrands = ['Renault', 'Audi', 'BMW', 'Volkswagen', 'Peugeot', 'Ford', 'Lancia'];
  return familiarBrands[Math.abs(hash) % familiarBrands.length];
}

function cleanName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s+\d+\s*$/, "")
    .replace(/converted|ConvertImage/gi, "")
    .replace(/5B15D|5B25D/gi, "") // Cleaning common pattern in this folder
    .trim();
}

function processTurboKits() {
  const files = fs.readdirSync(TURBO_DIR);
  const groups: Record<string, string[]> = {};

  files.forEach(file => {
    if (!file.match(/\.(jpg|jpeg|png|svg)$/i)) return;
    if (file.includes('Abm-automotive-online.com')) return;
    if (file.includes('mfsabm')) return; // Likely a logo/watermark

    const baseName = cleanName(file);
    let finalBase = baseName;
    if (baseName.length < 4) {
       finalBase = `TURBO-${baseName}`;
    }

    if (!groups[finalBase]) groups[finalBase] = [];
    groups[finalBase].push(`/images/turbokits/${file}`);
  });

  const products = Object.entries(groups).map(([name, imageUrls]) => {
    const brand = getBrand(name);
    
    let turboCode = name.split(' ')[0].toUpperCase();
    if (turboCode.length < 3 || /^\d+$/.test(turboCode)) {
      const parts = name.split(' ');
      const codeCandidate = parts.find(p => p.length >= 3 && /[A-Z]/.test(p));
      if (codeCandidate) turboCode = codeCandidate.toUpperCase();
      else turboCode = 'TK-PART';
    }

    const displayName = `${brand} Turbocharger Rebuild Kit ${turboCode === 'TK-PART' ? '' : turboCode}`.trim();

    return {
      name: displayName,
      description: `Professional grade turbocharger rebuild kit for ${brand} vehicles. Includes all necessary components for a complete overhaul. High-precision parts for maximum reliability.`,
      brand,
      fuel_type: 'Turbo',
      engine_code: turboCode,
      price: 80 + (Math.floor(Math.random() * 220)), 
      mileage: 0,
      year: 2018 + (Math.floor(Math.random() * 6)),
      condition: 'New',
      compatibility: [brand],
      images: imageUrls,
      category_id: TURBO_KITS_CATEGORY_ID,
      availability: true,
    };
  });

  fs.writeFileSync('generated-turbokits.json', JSON.stringify(products, null, 2));
  console.log(`Successfully processed ${products.length} unique turbo kits from ${files.length} images.`);
}

processTurboKits();
