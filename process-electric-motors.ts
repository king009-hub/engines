import fs from 'fs';
import path from 'path';

const ELECTRIC_DIR = 'public/images/electric-motors';
const ELECTRIC_CATEGORY_ID = 'e1ec781c-4078-4563-9ee5-a066a76cecbc';

const brands = [
  'Tesla', 'Smart', 'Renault', 'Nissan', 'BMW', 'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mercedes'
];

function getBrand(filename: string): string {
  const lower = filename.toLowerCase();
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  
  if (lower.includes('fortwo')) return 'Smart';
  
  // Fallback hash
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  const familiarBrands = ['Tesla', 'Smart', 'Renault', 'BMW', 'Volkswagen'];
  return familiarBrands[Math.abs(hash) % familiarBrands.length];
}

function cleanName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/\s*\d*\s*$/, "")
    .replace(/fortwo|electric|motor/gi, "")
    .trim();
}

function processElectricMotors() {
  if (!fs.existsSync(ELECTRIC_DIR)) {
    console.error('Directory not found:', ELECTRIC_DIR);
    return;
  }
  
  const files = fs.readdirSync(ELECTRIC_DIR);
  const groups: Record<string, string[]> = {};

  files.forEach(file => {
    if (!file.match(/\.(jpg|jpeg|png|svg)$/i)) return;
    
    let baseName = cleanName(file);
    if (file.toLowerCase().includes('smart')) {
      baseName = 'Smart Fortwo Electric Motor';
    }

    if (!baseName || baseName.length < 3) {
      baseName = `EV-${file.split(' ')[0]}`;
    }

    if (!groups[baseName]) groups[baseName] = [];
    groups[baseName].push(`/images/electric-motors/${file}`);
  });

  const products = Object.entries(groups).map(([name, imageUrls]) => {
    const brand = getBrand(name);
    
    let evCode = name.replace(/^EV-/, '').toUpperCase();
    if (evCode.length < 3 || /^\d+$/.test(evCode)) {
      const parts = name.split(' ');
      const codeCandidate = parts.find(p => p.length >= 3 && /[A-Z0-9]/.test(p));
      if (codeCandidate) evCode = codeCandidate.toUpperCase();
      else evCode = 'EV-UNIT';
    }

    const displayName = `${brand} Electric Motor ${evCode === 'EV-UNIT' ? '' : evCode}`.trim();

    return {
      name: displayName,
      description: `High-efficiency electric drive unit for ${brand} electric vehicles. Tested for insulation resistance, torque output, and bearing noise. Sustainable and reliable power for your EV.`,
      brand,
      fuel_type: 'Electric',
      engine_code: evCode,
      price: 800 + (Math.floor(Math.random() * 2200)), 
      mileage: 5000 + (Math.floor(Math.random() * 45000)),
      year: 2018 + (Math.floor(Math.random() * 6)),
      condition: 'Used - Excellent',
      compatibility: [brand],
      images: imageUrls,
      category_id: ELECTRIC_CATEGORY_ID,
      availability: true,
    };
  });

  fs.writeFileSync('generated-electric-motors.json', JSON.stringify(products, null, 2));
  console.log(`Successfully processed ${products.length} unique electric motors from ${files.length} images.`);
}

processElectricMotors();
