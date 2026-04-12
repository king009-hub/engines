import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const enginesDir = path.join('public', 'images', 'engines');

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
  // Check for Peugeot/Citroen models
  if (normalized.includes('308') || normalized.includes('5008') || normalized.includes('3008') || normalized.includes('508') || normalized.includes('puretech') || normalized.includes('hdi')) {
    return 'Peugeot'; // Default to Peugeot for these
  }
  return 'Generic';
}

function getFuelType(text: string) {
  const normalized = text.toLowerCase();
  if (normalized.includes('tdi') || normalized.includes('hdi') || normalized.includes('diesel') || normalized.includes('dci')) {
    return 'Diesel';
  }
  if (normalized.includes('tfsi') || normalized.includes('puretech') || normalized.includes('thp') || normalized.includes('gti') || normalized.includes('essence') || normalized.includes('petrol') || normalized.includes('hybrid')) {
    return 'Petrol';
  }
  return 'Diesel'; // Default
}

function cleanFilename(filename: string) {
  return filename
    .replace(/\.(jpg|jpeg|png|svg)$/i, '')
    .replace(/\s*\((\d+)\)$/, '')
    .replace(/\s*_\d+$/, '')
    .replace(/\s+\d+$/, '')
    .replace(/\s+engine$/i, '')
    .replace(/\s+motor$/i, '')
    .trim();
}

async function main() {
  // 1. Get Engines Category ID
  const { data: catData } = await supabase.from('categories').select('id').eq('slug', 'engines').single();
  if (!catData) {
    console.error('Engines category not found!');
    return;
  }
  const categoryId = catData.id;

  // 2. Delete existing engine products
  console.log('Deleting existing engine products...');
  const { error: deleteError } = await supabase.from('products').delete().eq('category_id', categoryId);
  if (deleteError) {
    console.error('Error deleting products:', deleteError.message);
    return;
  }

  // 3. Process images
  const files = fs.readdirSync(enginesDir).filter(f => f.match(/\.(jpg|jpeg|png|svg)$/i));
  const productMap = new Map<string, any>();

  for (const file of files) {
    const rawName = cleanFilename(file);
    if (rawName.match(/^\d{8}\s\d{6}$/)) continue; // Skip timestamped files without description

    const brand = getBrand(rawName);
    const fuelType = getFuelType(rawName);
    const key = `${brand}-${fuelType}-${rawName.toLowerCase()}`;

    if (productMap.has(key)) {
      const product = productMap.get(key);
      const imgPath = `/images/engines/${file}`;
      if (!product.images.includes(imgPath)) {
        product.images.push(imgPath);
      }
      continue;
    }

    let productName = rawName;
    if (brand !== 'Generic' && !rawName.toLowerCase().includes(brand.toLowerCase())) {
      productName = `${brand} ${rawName}`;
    }

    productMap.set(key, {
      name: productName,
      description: `High-quality used ${fuelType} engine for ${brand} vehicles. Fully tested and verified by our experts.`,
      brand: brand,
      fuel_type: fuelType,
      engine_code: rawName.split(' ')[0].toUpperCase(),
      price: 1200 + Math.floor(Math.random() * 1500),
      mileage: 60000 + Math.floor(Math.random() * 90000),
      year: 2014 + Math.floor(Math.random() * 9),
      condition: 'Used - Excellent Condition',
      compatibility: [brand],
      images: [`/images/engines/${file}`],
      category_id: categoryId,
      availability: true
    });
  }

  const products = Array.from(productMap.values());
  console.log(`Prepared ${products.length} unique engine products.`);

  // 4. Batch Upload
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const { error } = await supabase.from('products').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
    } else {
      console.log(`Uploaded batch ${i / batchSize + 1}/${Math.ceil(products.length / batchSize)}`);
    }
  }

  console.log('Finished uploading engines.');
}

main().catch(console.error);
