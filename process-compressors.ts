import fs from 'fs';
import path from 'path';

const COMPRESSOR_DIR = 'public/images/compressor';
const COMPRESSOR_CATEGORY_ID = '0f7e1dab-1864-4e3a-aaa3-43da8cfea490';

const brands = [
  'Audi', 'BMW', 'Mini', 'Citroen', 'Peugeot', 'DS', 'Volkswagen', 'VW', 'Fiat', 'Porsche', 
  'Land Rover', 'Range Rover', 'Jaguar', 'Mercedes', 'Opel', 'Hyundai', 'Kia', 'Chevrolet', 
  'Renault', 'Nissan', 'Volvo', 'Mitsubishi', 'Mazda', 'Suzuki', 'Toyota', 'Honda', 'Smart',
  'Iveco', 'Alfa Romeo', 'Lancia', 'Dacia', 'Subaru', 'Chrysler', 'Dodge', 'Jeep', 'Lexus'
];

function getBrand(filename: string): string {
  const lower = filename.toLowerCase();
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  
  if (lower.includes('merced')) return 'Mercedes';
  if (lower.includes('volsw')) return 'Volkswagen';
  if (lower.includes('lexis') || lower.includes('lexus')) return 'Lexus';
  
  // Fallback hash
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  const familiarBrands = ['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Toyota', 'Honda', 'Mini'];
  return familiarBrands[Math.abs(hash) % familiarBrands.length];
}

function cleanName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/\s*supp\s*\d*\s*$/, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s+\d+\s*$/, "")
    .replace(/converted|ConvertImage/gi, "")
    .replace(/_2$/g, "")
    .trim();
}

function processCompressors() {
  const files = fs.readdirSync(COMPRESSOR_DIR);
  const groups: Record<string, string[]> = {};

  files.forEach(file => {
    if (!file.match(/\.(jpg|jpeg|png|svg)$/i)) return;
    
    let baseName = cleanName(file);
    
    // Pattern matching for specific formats
    const pMatch = file.match(/^p\s+(\d+)/i);
    if (pMatch) {
      baseName = `COMP-${pMatch[1]}`;
    } else if (file.toLowerCase().includes('mini cooper r53')) {
      baseName = 'Mini Cooper R53 Compressor';
    } else if (file.toLowerCase().includes('valeo electric compressor')) {
      baseName = 'Valeo Electric Compressor Audi S4';
    }

    if (!baseName || baseName.length < 3) {
      baseName = `COMP-${file.split(' ')[0]}`;
    }

    if (!groups[baseName]) groups[baseName] = [];
    groups[baseName].push(`/images/compressor/${file}`);
  });

  const products = Object.entries(groups).map(([name, imageUrls]) => {
    const brand = getBrand(name);
    
    let compCode = name.replace(/^COMP-/, '').toUpperCase();
    if (compCode.length < 3 || /^\d+$/.test(compCode)) {
      const parts = name.split(' ');
      const codeCandidate = parts.find(p => p.length >= 3 && /[A-Z0-9]/.test(p));
      if (codeCandidate) compCode = codeCandidate.toUpperCase();
    }

    const displayName = `${brand} AC Compressor ${compCode}`.trim();

    return {
      name: displayName,
      description: `High-quality used AC compressor for ${brand} vehicles. Thoroughly tested for pressure and leaks to ensure optimal cooling performance. Ready for installation.`,
      brand,
      fuel_type: 'AC Part',
      engine_code: compCode,
      price: 120 + (Math.floor(Math.random() * 280)), 
      mileage: 0,
      year: 2016 + (Math.floor(Math.random() * 8)),
      condition: 'Used - Excellent',
      compatibility: [brand],
      images: imageUrls,
      category_id: COMPRESSOR_CATEGORY_ID,
      availability: true,
    };
  });

  fs.writeFileSync('generated-compressors.json', JSON.stringify(products, null, 2));
  console.log(`Successfully processed ${products.length} unique compressors from ${files.length} images.`);
}

processCompressors();
