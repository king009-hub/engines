import fs from 'fs';

function generateSql() {
  const products = JSON.parse(fs.readFileSync('generated-products.json', 'utf8'));
  
  const fileChunkSize = 500; // max products per file to stay under 1MB limit
  const statementChunkSize = 100; // max products per INSERT statement
  const timestamp = new Date().toISOString().replace(/\D/g, '').substring(0, 14);
  
  let fileIndex = 1;
  
  for (let i = 0; i < products.length; i += fileChunkSize) {
    const fileProducts = products.slice(i, i + fileChunkSize);
    
    let sql = '';
    if (i === 0) {
      sql += '-- Refresh products with better names and logic\n';
      sql += 'DELETE FROM public.products;\n\n';
    } else {
      sql += `-- Part ${fileIndex} of products upload\n\n`;
    }
    
    for (let j = 0; j < fileProducts.length; j += statementChunkSize) {
      const chunk = fileProducts.slice(j, j + statementChunkSize);
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
    
    const filename = `supabase/migrations/${timestamp}_refresh_products_part${fileIndex}.sql`;
    fs.writeFileSync(filename, sql);
    console.log(`Generated part ${fileIndex} with ${fileProducts.length} products to ${filename}.`);
    fileIndex++;
  }
}

generateSql();
