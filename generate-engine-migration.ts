import fs from 'fs';

function generateSql() {
  const products = JSON.parse(fs.readFileSync('generated-engines.json', 'utf8'));
  
  // Part 1
  let sql = '-- Refresh ONLY engines with correct grouping and professional names\n';
  sql += 'DELETE FROM public.products WHERE category_id = \'b72acdc6-f680-4fc0-9d05-a0568a244ceb\';\n\n';
  
  const statementChunkSize = 100;
  for (let i = 0; i < products.length; i += statementChunkSize) {
    const chunk = products.slice(i, i + statementChunkSize);
    sql += 'INSERT INTO public.products (name, description, brand, fuel_type, engine_code, price, mileage, year, condition, compatibility, images, category_id, availability) VALUES\n';
    
    const values = chunk.map(p => {
      const name = p.name.replace(/'/g, "''");
      const description = p.description.replace(/'/g, "''");
      const brand = p.brand.replace(/'/g, "''");
      const engineCode = p.engine_code.replace(/'/g, "''");
      const condition = p.condition.replace(/'/g, "''");
      const compatibility = `ARRAY[${p.compatibility.map((c: string) => `'${c.replace(/'/g, "''")}'`).join(',')}]`;
      const images = `ARRAY[${p.images.map((img: string) => `'${img.replace(/'/g, "''")}'`).join(',')}]`;
      const categoryId = p.category_id ? `'${p.category_id}'` : 'NULL';
      
      return `  ('${name}', '${description}', '${brand}', '${p.fuel_type}', '${engineCode}', ${p.price}, ${p.mileage}, ${p.year}, '${condition}', ${compatibility}, ${images}, ${categoryId}, ${p.availability})`;
    });
    
    sql += values.join(',\n') + ';\n\n';
  }
  
  const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
  const filename = `supabase/migrations/${timestamp}_refresh_engines_only.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Generated engine-only SQL migration with ${products.length} unique engines to ${filename}.`);
}

generateSql();
