import fs from 'fs';

function generateSql() {
  const products = JSON.parse(fs.readFileSync('generated-compressors.json', 'utf8'));
  
  let sql = '-- Refresh ONLY Compressors with correct grouping and professional names\n';
  sql += 'DELETE FROM public.products WHERE category_id = \'0f7e1dab-1864-4e3a-aaa3-43da8cfea490\';\n\n';
  
  const statementChunkSize = 50;
  for (let i = 0; i < products.length; i += statementChunkSize) {
    const chunk = products.slice(i, i + statementChunkSize);
    sql += 'INSERT INTO public.products (name, description, brand, fuel_type, engine_code, price, mileage, year, condition, compatibility, images, category_id, availability) VALUES\n';
    
    const values = chunk.map(p => {
      const name = p.name.replace(/'/g, "''");
      const description = p.description.replace(/'/g, "''");
      const brand = p.brand.replace(/'/g, "''");
      const compCode = p.engine_code.replace(/'/g, "''");
      const condition = p.condition.replace(/'/g, "''");
      const compatibility = `ARRAY[${p.compatibility.map((c: string) => `'${c.replace(/'/g, "''")}'`).join(',')}]`;
      const images = `ARRAY[${p.images.map((img: string) => `'${img.replace(/'/g, "''")}'`).join(',')}]`;
      
      const categoryId = p.category_id ? `'${p.category_id}'` : 'NULL';
      
      return `  ('${name}', '${description}', '${brand}', '${p.fuel_type}', '${compCode}', ${p.price}, ${p.mileage}, ${p.year}, '${condition}', ${compatibility}, ${images}, ${categoryId}, ${p.availability})`;
    });
    
    sql += values.join(',\n') + ';\n\n';
  }
  
  const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
  const filename = `supabase/migrations/${timestamp}_refresh_compressors_only.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Generated compressors-only SQL migration with ${products.length} unique items to ${filename}.`);
}

generateSql();
