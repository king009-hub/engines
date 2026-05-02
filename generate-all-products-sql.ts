import fs from 'fs';
import path from 'path';

const imagesDir = 'public/images';

const categoriesMap: Record<string, string> = {
  'gearbox': 'd9af257c-c611-4bfb-9fcc-a4e1c86f600c',
  'CHRA cartridges - Abm-automotive-online.com': 'cf30785d-b671-4b20-a03b-779d21861dc3',
  'compressor': '0f7e1dab-1864-4e3a-aaa3-43da8cfea490',
  'turbokits': '62b9a11b-16de-4563-9ee5-a066a76cecbd',
  'engines': 'b72acdc6-f680-4fc0-9d05-a0568a244ceb',
  'engine-parts': '8d457139-63c9-44a5-9533-6f4adda1efde',
  'turbocharger-rebuilt': '16490fcf-fdf1-483b-b2bd-df61aea9a8a8',
  'electric-motors': '8d457139-63c9-44a5-9533-6f4adda1efde', // Fallback to engine parts or find another
};

const knownBrands = [
  'Renault', 'Nissan', 'Mercedes', 'Volvo', 'Jeep', 'Toyota', 'VW', 'BMW', 'Audi', 'Fiat', 'Ford', 
  'Opel', 'Peugeot', 'Citroen', 'Mazda', 'Honda', 'Hyundai', 'Kia', 'Skoda', 'Seat', 'Mitsubishi', 
  'Land Rover', 'Porsche', 'Volkswagen', 'Rover', 'Alfa Romeo', 'Lancia', 'Dacia', 'Subaru', 'Suzuki',
  'Isuzu', 'Iveco', 'Man', 'Scania', 'DAF', 'Mini', 'Jaguar', 'Lexus', 'Chrysler', 'Dodge', 'Smart', 'Chevrolet', 'MG', 'Cadillac', 'Saab',
  'Abarth', 'Alfa', 'Bentley', 'Buick', 'Cupra', 'Ferrari', 'GMC', 'Hummer', 'Infiniti', 'Lamborghini', 'Lincoln', 'Lotus', 'Maserati', 'McLaren', 'Pontiac', 'Ram', 'Rolls-Royce', 'Tesla'
];

function getBrand(text: string) {
  const normalized = text.toLowerCase();
  
  // 1. Explicit brand names (whole word)
  if (normalized.includes('range rover') || normalized.includes('land rover') || normalized.includes('discovery') || normalized.includes('evoque')) return 'Land Rover';
  if (normalized.includes('mercedes') || normalized.includes('benz') || normalized.includes('sprinter') || normalized.includes('vito')) return 'Mercedes';
  
  for (const brand of knownBrands) {
    const brandLower = brand.toLowerCase();
    const regex = new RegExp(`\\b${brandLower}\\b`, 'i');
    if (normalized.match(regex)) return brand;
  }
  
  // 2. Model and Engine Code mapping
  if (normalized.match(/\b(mini|cooper|countryman|one|paceman|jcw|n12b16a|n14b16a|n16a4|n16b16a|n18b16a|b38a15a|b38a12a)\b/)) return 'Mini';
  if (normalized.match(/\b(golf|passat|tiguan|polo|touareg|touran|sharan|caddy|transporter|amarok|scirocco|bls|arl|bxe|bkp|asz|avf|awx|ajm|agr|alh|ahf|asv|aqm|aym|ake|bau|bdg|bdh|bcz|bfc|tdi|cfg|cfgb|bkp|bmm|bmp|bmn|bwa|axx|bpy|caea|caeb|cbfa|ccta|ccza|cczb)\b/)) return 'Volkswagen';
  if (normalized.match(/\b(a1|a3|a4|a5|a6|a7|a8|q2|q3|q5|q7|q8|tt|rs|s3|s4|s5|s6|s7|s8|cts|cdl|cdla|dft|dfta|dpc|dpca|bke|brd|bpw|blb|bre|bvg|bna|brf|bmr|buy|bva|bvf|bvy|bvz|bwa|bhz|bpy|bgb|bul|bwe|bpj|byt|bzb|cdaa|cdab|ccza|cczb|cesa|ceta|cdlc|cdlf|cdlg|cdma|crza|tfsi|fsi|tsi)\b/)) return 'Audi';
  if (normalized.match(/\b(series|x1|x2|x3|x4|x5|x6|x7|m3|m4|m5|m135i|m140i|n47|n57|b47|b48|b57|b58|n43|n52|n53|n54|n55|n20|n26|b37|b38|b46|n63|s63|n74|s55|s58|s65|s85|n47c20a|n47d20c|n57d30b|n57d30a|n57d30c|b57d30a|b57d30c|n63b44a|n47d16a|n52b30af)\b/)) return 'BMW';
  if (normalized.match(/\b(308|5008|3008|508|208|2008|expert|partner|boxer|puretech|hdi|rhh|rh02|ahw|bhy|bh02|4hh|4h03|4hn|ahn|ah03|dw10|5g06|rhc|ep6|ehz|dw10fc|bluehdi|dw10bted4|rhf|vti|ep3|ep3c|8fp|8f01)\b/)) return 'Peugeot';
  if (normalized.match(/\b(c3|c4|c5|berlingo|jumper|ds3|ds4|ds5|picasso|hn05|eb2|eb2dts|hny|hnv|spacetourer)\b/)) return 'Citroen';
  if (normalized.match(/\b(clio|megane|scenic|captur|kadjar|talisman|espace|kangoo|master|traffic|laguna|dci|k9k|f9q|g9u|g9t|m9r|m9t|v9x|h4b|h5f|h5h|m5m|m5p|m5r|r9m|r9n|v4y)\b/)) return 'Renault';
  if (normalized.match(/\b(corsa|astra|insignia|mokka|grandland|crossland|vivaro|movano|zafira|cdti|a14net|a14xer|b14xer|a16let|a16ler|a16les|a16xer|z16xer|z18xer|a20dth|a20dtl|a20dtj|a20dtr|b20dth|b16dth|b16dtl|b16dtj|b16dtr|pxl|z22d1)\b/)) return 'Opel';
  if (normalized.match(/\b(focus|fiesta|kuga|mondeo|transit|custom|ranger|s-max|galaxy|ecoboost|t-gdi|tdci|duratorq|sigma|duratec|fox|ecoblue|panther)\b/)) return 'Ford';
  if (normalized.match(/\b(qashqai|juke|navara|xtrail|x-trail|micra|note|leaf|terrano|zd30|yd25)\b/)) return 'Nissan';
  if (normalized.match(/\b(tucson|santa fe|i10|i20|i30|i40|ix20|ix35|kona|d4fe|d4hb|d4ea|g4la|g4lc|g4fg)\b/)) return 'Hyundai';
  
  // 3. Last resort - check if it's a known car brand from common abbreviations
  if (normalized.includes('vag')) return 'Volkswagen';
  if (normalized.includes('psa')) return 'Peugeot';
  
  return 'Auto Part'; 
}

function extractEngineCode(text: string) {
  const normalized = text.toUpperCase();
  
  // Look for OM... (Mercedes)
  const omMatch = normalized.match(/\b(OM\d{3,9})\b/);
  if (omMatch) return omMatch[1];
  
  // Look for N47... (BMW/Mini)
  const nMatch = normalized.match(/\b(N\d{2}[A-Z]\d{2}[A-Z])\b/);
  if (nMatch) return nMatch[1];
  
  // Look for K9K... (Renault/Nissan)
  const kMatch = normalized.match(/\b(K9K\d{3})\b/);
  if (kMatch) return kMatch[1];

  // Look for M9R... (Renault)
  const m9rMatch = normalized.match(/\b(M9R\d{3})\b/);
  if (m9rMatch) return m9rMatch[1];

  // Look for DW10... (Peugeot/Citroen)
  const dwMatch = normalized.match(/\b(DW10[A-Z0-9]*)\b/);
  if (dwMatch) return dwMatch[1];

  // Look for common 3-5 char codes
  const words = normalized.split(/[\s,._-]+/);
  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i];
    if (word.length >= 3 && word.length <= 10 && word.match(/^[A-Z0-9]+$/) && !word.match(/^\d+$/)) {
      if (!['TDI', 'HDI', 'DCI', 'CDTI', 'TFSI', 'FSI', 'TSI', 'GTI', 'VTI', 'HP', 'KW', 'ENGINE', 'MOTOR', 'USED', 'DIESEL', 'PETROL', 'PART', 'ABM'].includes(word)) {
        return word;
      }
    }
  }
  return 'N/A';
}

function cleanFilename(filename: string) {
  return filename
    .replace(/\.(jpg|jpeg|png|svg|webp)$/i, '')
    .replace(/\s*\(\d+\)$/g, '') // Remove (1), (2)
    .replace(/[\s_-]\d+$/g, '') // Remove _1, -1, 1 at the end
    .trim();
}

function escapeSql(str: string) {
  return str.replace(/'/g, "''");
}

function main() {
  const folders = fs.readdirSync(imagesDir);
  const productMap = new Map<string, any>();

  for (const folder of folders) {
    const folderPath = path.join(imagesDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const categoryId = categoriesMap[folder];
    if (!categoryId) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|jpeg|png|svg|webp)$/i));
    
    for (const file of files) {
      const rawName = cleanFilename(file);
      if (rawName.toLowerCase().includes('close') || rawName.toLowerCase().includes('24px')) continue;

      const brand = getBrand(rawName);
      const isTimestamped = rawName.match(/^\d{8}\s\d{6}$/);
      
      let key = '';
      if (isTimestamped) {
        key = `${folder}-ts-${rawName}`;
      } else {
        key = `${folder}-${rawName.toLowerCase()}`;
      }

      if (productMap.has(key)) {
        const product = productMap.get(key);
        const imgPath = `/images/${folder}/${file}`;
        if (!product.images.includes(imgPath)) {
          product.images.push(imgPath);
        }
        continue;
      }

      // Determine product name
      let productName = rawName;
      if (isTimestamped) {
        productName = `Used ${folder.replace(/-/g, ' ')} - ${rawName}`;
      } else if (brand !== 'Auto Part' && !rawName.toLowerCase().includes(brand.toLowerCase())) {
        productName = `${brand} ${rawName}`;
      }

      // Price logic
      let price = 150;
      if (folder === 'engines') price = 1200 + Math.floor(Math.random() * 2500);
      else if (folder === 'gearbox') price = 600 + Math.floor(Math.random() * 1200);
      else if (folder.includes('turbo')) price = 250 + Math.floor(Math.random() * 500);
      else if (folder === 'compressor') price = 180 + Math.floor(Math.random() * 300);
      else price = 80 + Math.floor(Math.random() * 200);

      productMap.set(key, {
        name: productName,
        description: `Premium quality used auto part. Brand: ${brand}. Fully tested and inspected for quality assurance. Includes warranty for peace of mind.`,
        brand: brand,
        fuel_type: 'Diesel',
        engine_code: isTimestamped ? 'N/A' : rawName.split(' ')[0].toUpperCase(),
        price: price,
        mileage: 40000 + Math.floor(Math.random() * 120000),
        year: 2014 + Math.floor(Math.random() * 9),
        condition: 'Tested - Excellent',
        compatibility: [brand],
        images: [`/images/${folder}/${file}`],
        category_id: categoryId,
        availability: true
      });
    }
  }

  const products = Array.from(productMap.values());
  console.log(`Identified ${products.length} unique products.`);

  let sql = '-- SQL Script for manual products upload with correct image paths\n';
  sql += 'DELETE FROM public.products;\n\n';

  const batchSize = 100;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    sql += 'INSERT INTO public.products (name, description, brand, fuel_type, engine_code, price, mileage, year, condition, compatibility, images, category_id, availability)\nVALUES\n';
    
    const values = batch.map(p => {
      const name = escapeSql(p.name);
      const description = escapeSql(p.description);
      const brand = escapeSql(p.brand);
      const engineCode = escapeSql(p.engine_code);
      const condition = escapeSql(p.condition);
      const compatibility = `ARRAY[${p.compatibility.map(c => `'${escapeSql(c)}'`).join(', ')}]`;
      const images = `ARRAY[${p.images.map(img => `'${escapeSql(img)}'`).join(', ')}]`;
      
      return `('${name}', '${description}', '${brand}', '${p.fuel_type}', '${engineCode}', ${p.price}, ${p.mileage}, ${p.year}, '${condition}', ${compatibility}, ${images}, '${p.category_id}', ${p.availability})`;
    });

    sql += values.join(',\n') + ';\n\n';
  }

  fs.writeFileSync('products-upload.sql', sql);
  console.log(`Generated SQL for ${products.length} products in products-upload.sql`);
}

main();
