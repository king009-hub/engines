import fs from 'fs';

interface Product {
  name: string;
  description: string;
  brand: string;
  fuel_type: string;
  engine_code: string;
  price: number;
  mileage: number;
  year: number;
  condition: string;
  compatibility: string[];
  images: string[];
  category_id: string;
  availability: boolean;
}

const products: Product[] = JSON.parse(fs.readFileSync('prepared-products.json', 'utf8'));

// Map brand names to IDs for the compatibility/brand filtering
const brandMap: Record<string, string> = {
  'TOYOTA': '2d7d7ab3-79ea-4894-9ada-af4d6a0d777a',
  'Audi': 'a8fec019-16fa-4500-94ff-61d41d69dc7d',
  'Rover': 'af843ef3-7cc2-44d4-ab16-16410f19f0e4',
  'Man': '45cdce2e-33e9-46a7-a6de-45febc82b735',
  'BMW': 'a40c48ff-b0ff-45cc-a93f-68ef6e891ebb',
  'Mercedes': '3bea8f83-23e9-4a7b-8a43-50e833492633',
  'Mini': 'b59538b6-dd34-4fef-a88c-45d233f4f40b',
  'Hyundai': '5fcd613d-ba1b-4e7a-87ae-b187ab7c0294',
  'Renault': 'df54461f-1675-4772-9f4d-3267bf507242',
  'Suzuki': '080fadc6-85f2-4d0e-a465-084ccac14184',
  'Fiat': '3cb20661-b014-4c9c-b5c0-3009a17d97f7',
  'Ford': '0342bdab-8b11-49c2-ab4a-0a44a5f8ab55',
  'Kia': 'f90138d0-684f-4944-af0c-bb452fcd0f76',
  'Peugeot': 'dc423e41-804d-46b7-a77a-9b91460c24f1',
  'Jaguar': '839f0db1-ed03-460a-ae91-737805a0bdce',
  'Land Rover': 'b632cabc-c02c-4e50-8c2f-492986efff9d',
  'Volvo': '7f57cfb1-19d3-4fdb-a3f7-0dccf0f1c0cb',
  'Alfa Romeo': '677f353d-b358-4db6-bcd2-aa96ab9c378c',
  'Isuzu': 'f7e607eb-b1fc-4334-90de-16d3ab433884',
  'Iveco': '40494cc6-22ed-48ae-b759-e50a4483d649',
  'Nissan': '0f2377c1-4654-4cae-9c5d-990398f347e9',
  'Subaru': '10e3c9cc-2fb8-4c4f-be6a-513f54382c21',
  'Toyota': '6a5c980e-24e3-49b1-bf59-500fdc06f375',
  'Opel': 'dfcfd7ef-e280-46fe-a7ab-1cc775d66203',
  'Citroen': '642c676f-4664-4c4d-812d-63bef8cebc9a',
  'Honda': 'f3fb00eb-2455-4b10-8afc-5979e3571901',
  'Jeep': '0565a541-548d-4f7b-989d-380f3fc30ae0',
  'Porsche': '4da42be5-954c-4a81-be3e-bc966a6dac3a',
  'Mitsubishi': '5e9b3e5d-31c7-4f94-8623-96bc5038d5ac',
  'Seat': '12fc96c1-a4b4-4882-bf49-1ae9cdf5aeb9',
};

function escapeSql(str: string) {
  return str.replace(/'/g, "''");
}

let sql = '-- SQL Script to upload refined products to Supabase\n';
sql += '-- This script includes 1712 unique products with grouped images\n';
sql += 'DELETE FROM public.products; -- Optional: Clear existing products first\n\n';

const batchSize = 50;
for (let i = 0; i < products.length; i += batchSize) {
  const batch = products.slice(i, i + batchSize);
  
  sql += 'INSERT INTO public.products (name, description, brand, fuel_type, engine_code, price, mileage, year, condition, compatibility, images, category_id, availability)\nVALUES\n';
  
  const values = batch.map(p => {
    const name = escapeSql(p.name);
    const description = escapeSql(p.description);
    const brand = escapeSql(p.brand);
    const fuelType = escapeSql(p.fuel_type);
    const engineCode = escapeSql(p.engine_code);
    const condition = escapeSql(p.condition);
    
    // Format arrays for PostgreSQL text[] type
    const compatibility = `ARRAY[${p.compatibility.map(c => `'${escapeSql(c)}'`).join(', ')}]`;
    const images = `ARRAY[${p.images.map(img => `'${escapeSql(img)}'`).join(', ')}]`;
    
    return `('${name}', '${description}', '${brand}', '${fuelType}', '${engineCode}', ${p.price}, ${p.mileage}, ${p.year}, '${condition}', ${compatibility}, ${images}, '${p.category_id}', ${p.availability})`;
  });

  sql += values.join(',\n') + ';\n\n';

  // Also insert into category_brands to ensure filtering works
  batch.forEach(p => {
    const brandId = brandMap[p.brand];
    if (brandId && p.category_id) {
      sql += `INSERT INTO public.category_brands (category_id, brand_id) VALUES ('${p.category_id}', '${brandId}') ON CONFLICT DO NOTHING;\n`;
    }
  });
  sql += '\n';
}

fs.writeFileSync('products-upload.sql', sql);
console.log(`Generated refined SQL for ${products.length} products in products-upload.sql`);
