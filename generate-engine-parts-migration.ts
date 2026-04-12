import fs from 'fs';

function generateSql() {
  const products = JSON.parse(fs.readFileSync('generated-engine-parts.json', 'utf8'));
  
  let sql = '-- Refresh ONLY engine parts with correct grouping and professional names\n';
  sql += 'DELETE FROM public.products WHERE category_id = \'8d457139-63c9-44a5-9533-6f4adda1efde\' OR category_id IN (SELECT id FROM public.categories WHERE parent_id = \'8d457139-63c9-44a5-9533-6f4adda1efde\');\n\n';
  
  const statementChunkSize = 50; // Smaller chunks for complex subqueries
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
      
      // Use subquery to get subcategory ID by slug
      const categoryIdQuery = `(SELECT id FROM public.categories WHERE slug = '${p.sub_slug}' LIMIT 1)`;
      
      return `  ('${name}', '${description}', '${brand}', '${p.fuel_type}', '${engineCode}', ${p.price}, ${p.mileage}, ${p.year}, '${condition}', ${compatibility}, ${images}, ${categoryIdQuery}, ${p.availability})`;
    });
    
    sql += values.join(',\n') + ';\n\n';
  }
  
  const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
  const filename = `supabase/migrations/${timestamp}_refresh_engine_parts_only.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Generated engine-parts-only SQL migration with ${products.length} unique parts to ${filename}.`);
}

generateSql();
