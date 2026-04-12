import fs from 'fs';
import path from 'path';

const categoriesMap: Record<string, { id: string, name: string }> = {
  'Boites à vitesses': { id: 'd9af257c-c611-4bfb-9fcc-a4e1c86f600c', name: 'Boites à vitesses' },
  'CHRA cartridges': { id: '16490fcf-fdf1-483b-b2bd-df61aea9a8a8', name: 'CHRA cartridges' },
  'Compresseurs': { id: '8d457139-63c9-44a5-9533-6f4adda1efde', name: 'Compresseurs' },
  'Kits réfection turbo': { id: '62b9a11b-16de-4563-9ee5-a066a76cecbd', name: 'Kits réfection turbo' },
  'Moteurs': { id: 'b72acdc6-f680-4fc0-9d05-a0568a244ceb', name: 'Moteurs' },
};

const knownBrands = [
  'Renault', 'Nissan', 'Mercedes', 'Volvo', 'Jeep', 'Toyota', 'VW', 'BMW', 'Audi', 'Fiat', 'Ford', 
  'Opel', 'Peugeot', 'Citroen', 'Mazda', 'Honda', 'Hyundai', 'Kia', 'Skoda', 'Seat', 'Mitsubishi', 
  'Land Rover', 'Porsche', 'Volkswagen', 'Rover', 'Alfa Romeo', 'Lancia', 'Dacia', 'Subaru', 'Suzuki',
  'Isuzu', 'Iveco', 'Man', 'Scania', 'DAF', 'Mini', 'Jaguar', 'Lexus', 'Chrysler', 'Dodge', 'Smart'
];

const imagesDir = path.join('public', 'images');

function getBrand(text: string) {
  const normalized = text.toLowerCase();
  for (const brand of knownBrands) {
    if (normalized.includes(brand.toLowerCase())) return brand;
  }
  return null;
}

function analyzeImages() {
  const categoryImages: Record<string, string> = {};
  const brandImages: Record<string, string> = {};
  const categoryBrands: Record<string, Set<string>> = {};
  const allFoundBrands = new Set<string>();

  const folders = fs.readdirSync(imagesDir);

  for (const folder of folders) {
    const folderPath = path.join(imagesDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const catInfo = Object.entries(categoriesMap).find(([key]) => folder.includes(key));
    if (!catInfo) continue;
    const [catKey, catData] = catInfo;

    const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|jpeg|png|svg)$/i));
    
    // Pick first image as category representative if not set
    if (files.length > 0 && !categoryImages[catData.id]) {
      categoryImages[catData.id] = `/images/${folder}/${files[0]}`;
    }

    if (!categoryBrands[catData.id]) categoryBrands[catData.id] = new Set();

    for (const file of files) {
      const brand = getBrand(file) || getBrand(folder);
      if (brand) {
        allFoundBrands.add(brand);
        categoryBrands[catData.id].add(brand);
        
        // Pick first image containing brand name as brand representative
        if (!brandImages[brand]) {
          brandImages[brand] = `/images/${folder}/${file}`;
        }
      }
    }
  }

  return { categoryImages, brandImages, categoryBrands, allFoundBrands };
}

const data = analyzeImages();

let sql = '-- Update Category Images\n';
for (const [id, img] of Object.entries(data.categoryImages)) {
  sql += `UPDATE public.categories SET image_url = '${img}' WHERE id = '${id}';\n`;
}

sql += '\n-- Ensure Brands exist and have images\n';
for (const brand of data.allFoundBrands) {
  const img = data.brandImages[brand] || null;
  const slug = brand.toLowerCase().replace(/\s+/g, '-');
  sql += `INSERT INTO public.brands (name, slug, image_url) VALUES ('${brand}', '${slug}', ${img ? `'${img}'` : 'NULL'}) 
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;\n`;
}

sql += '\n-- Associate Brands with Categories\n';
sql += 'DELETE FROM public.category_brands;\n';
for (const [catId, brands] of Object.entries(data.categoryBrands)) {
  for (const brandName of brands) {
    const brandSlug = brandName.toLowerCase().replace(/\s+/g, '-');
    sql += `INSERT INTO public.category_brands (category_id, brand_id) 
SELECT '${catId}', id FROM public.brands WHERE slug = '${brandSlug}'
ON CONFLICT DO NOTHING;\n`;
  }
}

fs.writeFileSync('supabase/migrations/20260322101554_brand_category_images.sql', sql);
console.log('Generated brand/category image migration.');
