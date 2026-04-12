import fs from 'fs';

function generateSql() {
  const products = JSON.parse(fs.readFileSync('generated-electric-motors.json', 'utf8'));
  
  let sql = '-- Refresh ONLY Electric Motors with correct grouping and professional names\n';
  sql += 'DELETE FROM public.products WHERE category_id = \'e1ec781c-4078-4563-9ee5-a066a76cecbc\';\n\n';
  
  const statementChunkSize = 50;
  for (let i = 0; i < products.length; i += statementChunkSize) {
    const chunk = products.slice(i, i + statementChunkSize);
    sql += 'INSERT INTO public.products (name, description, brand, fuel_type, engine_code, price, mileage, year, condition, compatibility, images, category_id, availability) VALUES\n';
    
    const values = chunk.map(p => {
      const name = p.name.replace(/'/g, "''");
      const description = p.description.replace(/'/g, "''");
      const brand = p.brand.replace(/'/g, "''");
      const evCode = p.engine_code.replace(/'/g, "''");
      const condition = p.condition.replace(/'/g, "''");
      const compatibility = `ARRAY[${p.compatibility.map((c: string) => `'${c.replace(/'/g, "''")}'`).join(',')}]`;
      const images = `ARRAY[${p.images.map((img: string) => `'${img.replace(/'/g, "''")}'`).join(',')}]`;
      
      // Use subquery to get ID by slug to handle existing categories safely
      const categoryIdQuery = `(SELECT id FROM public.categories WHERE slug = 'electric-motors' LIMIT 1)`;
      
      return `  ('${name}', '${description}', '${brand}', '${p.fuel_type}', '${evCode}', ${p.price}, ${p.mileage}, ${p.year}, '${condition}', ${compatibility}, ${images}, ${categoryIdQuery}, ${p.availability})`;
    });
    
    sql += values.join(',\n') + ';\n\n';
  }
  
  const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
  const filename = `supabase/migrations/${timestamp}_refresh_electric_motors_only.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Generated electric-motors-only SQL migration with ${products.length} unique items to ${filename}.`);
}

generateSql();
