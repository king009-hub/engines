import fs from 'fs';

function generateSql() {
  const products = JSON.parse(fs.readFileSync('generated-gearboxes.json', 'utf8'));
  
  let sql = '-- Refresh ONLY gearboxes with correct grouping and professional names\n';
  sql += 'DELETE FROM public.products WHERE category_id = \'d9af257c-c611-4bfb-9fcc-a4e1c86f600c\' OR category_id IN (SELECT id FROM public.categories WHERE parent_id = \'d9af257c-c611-4bfb-9fcc-a4e1c86f600c\');\n\n';
  
  const statementChunkSize = 50;
  for (let i = 0; i < products.length; i += statementChunkSize) {
    const chunk = products.slice(i, i + statementChunkSize);
    sql += 'INSERT INTO public.products (name, description, brand, fuel_type, engine_code, price, mileage, year, condition, compatibility, images, category_id, availability) VALUES\n';
    
    const values = chunk.map(p => {
      const name = p.name.replace(/'/g, "''");
      const description = p.description.replace(/'/g, "''");
      const brand = p.brand.replace(/'/g, "''");
      const gearboxCode = p.engine_code.replace(/'/g, "''"); // Using engine_code column for gearbox codes
      const condition = p.condition.replace(/'/g, "''");
      const compatibility = `ARRAY[${p.compatibility.map((c: string) => `'${c.replace(/'/g, "''")}'`).join(',')}]`;
      const images = `ARRAY[${p.images.map((img: string) => `'${img.replace(/'/g, "''")}'`).join(',')}]`;
      
      const categoryId = p.category_id ? `'${p.category_id}'` : 'NULL';
      
      return `  ('${name}', '${description}', '${brand}', '${p.fuel_type}', '${gearboxCode}', ${p.price}, ${p.mileage}, ${p.year}, '${condition}', ${compatibility}, ${images}, ${categoryId}, ${p.availability})`;
    });
    
    sql += values.join(',\n') + ';\n\n';
  }
  
  const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
  const filename = `supabase/migrations/${timestamp}_refresh_gearboxes_only.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Generated gearbox-only SQL migration with ${products.length} unique items to ${filename}.`);
}

generateSql();
