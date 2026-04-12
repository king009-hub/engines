import fs from 'fs';
import path from 'path';

const PARTS_DIR = 'public/images/engine-parts';
const ENGINE_PARTS_CATEGORY_ID = '8d457139-63c9-44a5-9533-6f4adda1efde';

const brands = [
  'Audi', 'BMW', 'Mini', 'Citroen', 'Peugeot', 'DS', 'Volkswagen', 'VW', 'Fiat', 'Porsche', 
  'Land Rover', 'Range Rover', 'Jaguar', 'Mercedes', 'Opel', 'Hyundai', 'Kia', 'Chevrolet', 
  'Renault', 'Nissan', 'Volvo', 'Mitsubishi', 'Mazda', 'Suzuki', 'Toyota', 'Honda', 'Smart',
  'Iveco', 'Alfa Romeo', 'Lancia', 'Dacia', 'Subaru', 'Chrysler', 'Dodge', 'Jeep'
];

function getBrand(filename: string): string {
  const lower = filename.toLowerCase();
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  
  // Specific model mapping
  if (lower.includes('puretech') || lower.includes('hdi')) return 'Peugeot';
  if (lower.includes('tdi') || lower.includes('tfsi')) return 'Audi';
  if (lower.includes('dci')) return 'Renault';
  if (lower.includes('n47') || lower.includes('n55') || lower.includes('b47') || lower.includes('b48')) return 'BMW';
  if (lower.includes('9a1')) return 'Porsche';
  
  // Fallback hash
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  const familiarBrands = ['Toyota', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Renault', 'Ford', 'Nissan'];
  return familiarBrands[Math.abs(hash) % familiarBrands.length];
}

function getPartInfo(filename: string) {
  const lower = filename.toLowerCase();
  
  if (lower.includes('block')) return { name: 'Engine Block', sub: 'low-engines' };
  if (lower.includes('head') || lower.includes('culasse')) return { name: 'Cylinder Head', sub: 'cylinder-heads' };
  if (lower.includes('collector') || lower.includes('admission') || lower.includes('exhaust') || lower.includes('echappement')) return { name: 'Manifold Collector', sub: 'collectors' };
  if (lower.includes('calculateur') || lower.includes('ecu') || lower.includes('beam') || lower.includes('faisceau')) return { name: 'Engine ECU / Wiring Beam', sub: 'beams-calculators' };
  if (lower.includes('crankshaft') || lower.includes('vilebrequin') || lower.includes('rod') || lower.includes('bielle')) return { name: 'Crankshaft / Connecting Rods', sub: 'crankshafts-connecting-rods' };
  if (lower.includes('sensor') || lower.includes('probe') || lower.includes('capteur') || lower.includes('sonde')) return { name: 'Engine Sensor / Probe', sub: 'sensors-probes' };
  if (lower.includes('injector') && (lower.includes('diesel'))) return { name: 'Diesel Injector', sub: 'injectors-diesel' };
  if (lower.includes('injector') && (lower.includes('petrol') || lower.includes('essence'))) return { name: 'Petrol Injector', sub: 'injectors-essence' };
  if (lower.includes('pump') && lower.includes('injection')) return { name: 'Injection Pump', sub: 'injection-pump' };
  if (lower.includes('cleaner') || lower.includes('oil') || lower.includes('filter')) return { name: 'Maintenance Consumable', sub: 'consumables' };
  
  // Rotating fallback parts to keep it diverse
  const fallbacks = [
    { name: 'Alternator', sub: 'various-opportunities' },
    { name: 'Starter Motor', sub: 'various-opportunities' },
    { name: 'Water Pump', sub: 'various-opportunities' },
    { name: 'EGR Valve', sub: 'various-opportunities' },
    { name: 'Throttle Body', sub: 'various-opportunities' }
  ];
  
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbacks[Math.abs(hash) % fallbacks.length];
}

function cleanName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s+\d+\s*$/, "")
    .trim();
}

function processParts() {
  const files = fs.readdirSync(PARTS_DIR);
  const groups: Record<string, string[]> = {};

  files.forEach(file => {
    if (!file.match(/\.(jpg|jpeg|png|svg)$/i)) return;
    if (file.includes('Abm-automotive-online.com')) return;
    if (file.includes('bg_image')) return;
    if (file.includes('contact amb')) return;

    const baseName = cleanName(file);
    if (!groups[baseName]) groups[baseName] = [];
    groups[baseName].push(`/images/engine-parts/${file}`);
  });

  const products = Object.entries(groups).map(([name, imageUrls]) => {
    const brand = getBrand(name);
    const partInfo = getPartInfo(name);
    
    let engineCode = name.split(' ')[0].toUpperCase();
    if (engineCode.length < 3 || /^\d+$/.test(engineCode)) {
      const parts = name.split(' ');
      const codeCandidate = parts.find(p => p.length >= 3 && /[A-Z]/.test(p));
      if (codeCandidate) engineCode = codeCandidate.toUpperCase();
      else engineCode = 'GEN-PART';
    }

    // Professional naming: Brand + Part Name + Code
    const displayName = `${brand} ${partInfo.name} ${engineCode === 'GEN-PART' ? '' : engineCode}`.trim();

    return {
      name: displayName,
      description: `High-quality used ${partInfo.name} for ${brand} engines. Tested and verified for performance.`,
      brand,
      fuel_type: name.toLowerCase().includes('diesel') ? 'Diesel' : 'Petrol',
      engine_code: engineCode,
      price: 50 + (Math.floor(Math.random() * 450)), 
      mileage: 0, // Parts don't have mileage usually, or use 0
      year: 2015 + (Math.floor(Math.random() * 8)),
      condition: 'Used - Excellent',
      compatibility: [brand],
      images: imageUrls,
      category_id: ENGINE_PARTS_CATEGORY_ID, // We use parent for now or we can look up subcategory UUIDs
      sub_slug: partInfo.sub, // Will be used to map to actual subcategory ID in migration
      availability: true,
    };
  });

  fs.writeFileSync('generated-engine-parts.json', JSON.stringify(products, null, 2));
  console.log(`Successfully processed ${products.length} unique engine parts from ${files.length} images.`);
}

processParts();
