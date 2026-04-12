import fs from 'fs';
import path from 'path';

const enginesDir = 'public/images/engines';
const ENGINE_CATEGORY_ID = 'b72acdc6-f680-4fc0-9d05-a0568a244ceb';

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
  // Prioritize Land Rover over Rover
  if (normalized.includes('range rover') || normalized.includes('land rover') || normalized.includes('discovery') || normalized.includes('evoque')) return 'Land Rover';
  
  for (const brand of knownBrands) {
    const brandLower = brand.toLowerCase();
    const regex = new RegExp(`\\b${brandLower}\\b`, 'i');
    if (normalized.match(regex)) return brand;
  }
  
  // 2. Model and Engine Code mapping for better brand detection
  // Prioritize specific models to avoid generic word overlaps (like "man" in "countryman")
  if (normalized.match(/\b(mini|cooper|countryman|one|paceman|jcw|n12b16a|n14b16a|n16a4|n16b16a|n18b16a|b38a15a|b38a12a)\b/)) return 'Mini';
  if (normalized.match(/\b(golf|passat|tiguan|polo|touareg|touran|sharan|caddy|transporter|amarok|scirocco|bls|arl|bxe|bkp|asz|avf|awx|ajm|agr|alh|ahf|asv|aqm|aym|ake|bau|bdg|bdh|bcz|bfc|tdi|cfg|cfgb)\b/)) return 'Volkswagen';
  if (normalized.match(/\b(a1|a3|a4|a5|a6|a7|a8|q2|q3|q5|q7|q8|tt|rs|s3|s4|s5|s6|s7|s8|cts|cdl|cdla|dft|dfta|dpc|dpca|bke|brd|bpw|blb|bre|bvg|bna|brf|bmr|buy|bva|bvf|bvy|bvz|bwa|bhz|bpy|bgb|bul|bwe|bpj|byt|bzb|cdaa|cdab|ccza|cczb|cesa|ceta|cdlc|cdlf|cdlg|cdma|crza|tfsi|fsi|tsi)\b/)) return 'Audi';
  if (normalized.match(/\b(series|x1|x2|x3|x4|x5|x6|x7|m3|m4|m5|m135i|m140i|n47|n57|b47|b48|b57|b58|n43|n52|n53|n54|n55|n20|n26|b37|b38|b46|n63|s63|n74|s55|s58|s65|s85|n47c20a|n47d20c|n57d30b|n57d30a|n57d30c|b57d30a|b57d30c|n63b44a|n47d16a|n52b30af)\b/)) return 'BMW';
  if (normalized.match(/\b(308|5008|3008|508|208|2008|expert|partner|boxer|puretech|hdi|rhh|rh02|ahw|bhy|bh02|4hh|4h03|4hn|ahn|ah03|dw10|5g06|rhc|ep6|ehz|dw10fc|bluehdi|dw10bted4|rhf|vti|ep3|ep3c|8fp|8f01)\b/)) return 'Peugeot';
  if (normalized.match(/\b(c3|c4|c5|berlingo|jumper|ds3|ds4|ds5|picasso|hn05|eb2|eb2dts|hny|hnv|spacetourer)\b/)) return 'Citroen';
  if (normalized.match(/\b(clio|megane|scenic|captur|kadjar|talisman|espace|kangoo|master|traffic|laguna|dci|k9k|f9q|g9u|g9t|m9r|m9t|v9x|h4b|h5f|h5h|m5m|m5p|m5r|r9m|r9n|v4y)\b/)) return 'Renault';
  if (normalized.match(/\b(corsa|astra|insignia|mokka|grandland|crossland|vivaro|movano|zafira|cdti|a14net|a14xer|b14xer|a16let|a16ler|a16les|a16xer|z16xer|z18xer|a20dth|a20dtl|a20dtj|a20dtr|b20dth|b16dth|b16dtl|b16dtj|b16dtr|pxl|z22d1)\b/)) return 'Opel';
  if (normalized.match(/\b(focus|fiesta|kuga|mondeo|transit|custom|ranger|s-max|galaxy|ecoboost|t-gdi|tdci|duratorq|sigma|duratec|fox|ecoblue|panther)\b/)) return 'Ford';
  if (normalized.match(/\b(qashqai|juke|navara|xtrail|x-trail|micra|note|leaf|terrano|zd30|yd25)\b/)) return 'Nissan';
  if (normalized.match(/\b(tucson|santa fe|i10|i20|i30|i40|ix20|ix35|kona|d4fe|d4hb|d4ea|g4la|g4lc|g4fg)\b/)) return 'Hyundai';
  if (normalized.match(/\b(octavia|superb|kodiaq|karog|kamiq|fabia|rapid|yeti|cfhc|cfhf|cayc|clha|crkb|cxxb|dbka|ddya|dgte|djka|dkrf|dkra|dkrc|chya|chyb|cpga|czea|czda|chzb|chzc|chzd|dkla|dklb|dkld|dkrf|dpca|dfga|dfha|dbga|dtua|dtsa|dtsb)\b/)) return 'Skoda';
  if (normalized.match(/\b(leon|ibiza|ateca|arona|tarraco|alhambra|cay|clh|crk|cxx|dbk|ddy|dgt|djk|dkr|dkc|chy|cpg|cze|czd|chz|dkl|dkf|dpc|dfg|dfh|dbg|dtu|dts)\b/)) return 'Seat';
  if (normalized.match(/\b(f-pace|e-pace|i-pace|xe|xf|xj|f-type|306dt|204dtd|276dt)\b/)) return 'Jaguar';
  if (normalized.match(/\b(evoque|discovery|sport|velar|defender|vogue|hse|306dt|204dtd|276dt|448dt|368dt|tdv6|tdv8|sdv6|sdv8)\b/)) return 'Land Rover';
  if (normalized.match(/\b(giulietta|giulia|stelvio|mito|940|952|949|955)\b/)) return 'Alfa Romeo';
  if (normalized.match(/\b(punto|panda|tipo|ducato|doblo|500x|500l|multijet|199b4000|55263624|188a9000|199a3000|199a2000|199a9000|263a2000|223a6000|192a8000|937a5000|937a3000|939a2000|939a3000|939a9000|844a3000|198a2000|198a3000|198a5000|198a6000|250a1000|250a2000|160a7000|263a1000|263a4000|263a5000|263a8000|263a9000|955a3000|955a4000|940a3000|940a4000|940a5000|940a7000|940a8000|960a1000|939b1000|199b1000|199b2000|312a2000|312a5000|312a7000|55266388|55260384|55263087|55263088|55263113|55263114|55263115|55263116|55263117|55263118|55263119|55263120)\b/)) return 'Fiat';
  if (normalized.match(/\b(651911|651912|651913|651916|651921|651924|651925|651930|651940|651950|651955|651956|651957|651960|651961|651980|642820|642822|642826|642830|642832|642834|642835|642836|642838|642850|642852|642853|642854|642855|642856|642858|642861|642862|642868|642870|642872|642873|642884|642886|642887|642889|642890|642896|642898|642899|654920|271820|271860|271861|272911|272920|272921|272922|272940|272941|272942|272943|272944|272945|272946|272947|272948|272949|272952|272960|272961|272963|272964|272965|272966|272967|272968|272969|272970|272971|272972|272973|272974|272975|272977|272978|272979|272980|272981|272982|272983|272984|272985|272988|272991|273922|273923|273924|273941|273943|273944|273945|273960|273961|273962|273963|273965|273966|273967|273968|273970|273971|274910|274920|276921|276923|276925|276950|276952|276955|276957|276958|276960|278910|278912|278920|278922|278927|278928|278929|278932|om270910|om651955|om651958|om651|sprinter|vito|viano|mercedes)\b/)) return 'Mercedes';
  if (normalized.match(/\b(2tne68|cdm|4m42|canter)\b/)) return 'Mitsubishi';
  if (normalized.match(/\b(j05e|j08e|n04c)\b/)) return 'Hino';
  if (normalized.match(/\b(isbe|isde|isle|ism|isx|qsb|qsc|qsl|qsx)\b/)) return 'Cummins';
  if (normalized.match(/\b(d4d|1kd|2kd|1gd|2gd|1vd|1kz|1hz|2tr|1ar|2ar|8ar|1ur|2ur|3ur|1gr|2gr|7gr|1mz|2mz|3mz|1nz|2nz|1zz|2zz|3zz|4zz|1az|2az|1kr|1nr|2nr|1zr|2zr|3zr|1sz|2sz|1uz|2uz|3uz|1uz-fe|2uz-fe|3uz-fe|1jz|2jz|1gz|7m|1ge|2ge|3ge|4ge|5ge|6ge|1g-fe|1g-gte|1g-gze|1g-e|1g-gp|1g-gpe|1g-gzu|2g-fe|3g-fe|4g-fe|1gr-fe|2gr-fe|3gr-fe|4gr-fe|5gr-fe|1ur-fe|1ur-fse|2ur-fse|2ur-gse|3ur-fe|1lr-gue|1ur-fse|2ur-fse|2ur-gse|3ur-fe|1lr-gue)\b/)) return 'Toyota';
  
  // 3. Fallback for common generic words that often appear in filenames
  if (normalized.includes('v6') || normalized.includes('v8')) return 'Generic Performance';
  
  return 'Generic';
}

function getFuelType(text: string) {
  const normalized = text.toLowerCase();
  // Diesel markers
  if (normalized.match(/\b(tdi|hdi|dci|cdti|jtd|multijet|d4d|did|diesel|d)\b/)) return 'Diesel';
  // Petrol markers
  if (normalized.match(/\b(tfsi|fsi|tsi|puretech|thp|gti|vti|ecoboost|t-gdi|vvti|essence|petrol|i|t)\b/)) return 'Petrol';
  // Default to Diesel if unknown (common for engines)
  return 'Diesel';
}

function cleanFilename(filename: string) {
  return filename
    .replace(/\.(jpg|jpeg|png|svg)$/i, '')
    .replace(/\s*\(\d+\)$/g, '') // Remove (1), (2)
    .replace(/[\s_-]\d+$/g, '') // Remove _1, -1, 1 at the end
    .trim();
}

function extractEngineCode(text: string) {
  const normalized = text.toUpperCase();
  
  // Look for OM... (Mercedes)
  const omMatch = normalized.match(/\b(OM\d{6,9})\b/);
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

  // Look for common 3-5 char codes at the end of engine descriptions
  // e.g., "1.9 TDI 105 BLS" -> BLS
  const words = normalized.split(/[\s,._-]+/);
  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i];
    if (word.length >= 3 && word.length <= 10 && word.match(/^[A-Z0-9]+$/) && !word.match(/^\d+$/)) {
      if (!['TDI', 'HDI', 'DCI', 'CDTI', 'TFSI', 'FSI', 'TSI', 'GTI', 'VTI', 'HP', 'KW', 'ENGINE', 'MOTOR', 'USED', 'DIESEL', 'PETROL'].includes(word)) {
        return word;
      }
    }
  }
  return 'N/A';
}

function escapeSql(str: string) {
  return str.replace(/'/g, "''");
}

function main() {
  const files = fs.readdirSync(enginesDir).filter(f => f.match(/\.(jpg|jpeg|png|svg)$/i));
  const productMap = new Map<string, any>();

  for (const file of files) {
    const rawName = file.replace(/\.(jpg|jpeg|png|svg)$/i, '');
    const isTimestamped = rawName.match(/^\d{8}\s\d{6}$/);
    
    // Grouping logic:
    // If timestamped, it's likely a unique photo. But if two photos are very close in time, they might be the same engine.
    // Let's group timestamped photos within 2 minutes of each other.
    let key = '';
    if (isTimestamped) {
      const timeStr = rawName.split(' ')[1];
      const hours = parseInt(timeStr.substring(0, 2));
      const mins = parseInt(timeStr.substring(2, 4));
      const timeKey = `${rawName.split(' ')[0]}_${hours}_${Math.floor(mins/2)}`;
      key = `ts-${timeKey}`;
    } else {
      key = cleanFilename(file).toLowerCase();
    }

    if (productMap.has(key)) {
      const product = productMap.get(key);
      const imgPath = `/images/engines/${file}`;
      if (!product.images.includes(imgPath)) {
        product.images.push(imgPath);
      }
      continue;
    }

    const brand = getBrand(rawName);
    const fuelType = getFuelType(rawName);
    const engineCode = extractEngineCode(rawName);
    
    let productName = rawName;
    if (isTimestamped) {
      productName = `Used ${fuelType} Engine - ${rawName}`;
    } else {
      // Clean up product name for display
      productName = rawName
        .replace(/\s*\(\d+\)$/g, '')
        .replace(/[\s_-]\d+$/g, '')
        .trim();
      
      if (brand !== 'Generic' && !productName.toLowerCase().includes(brand.toLowerCase())) {
        productName = `${brand} ${productName}`;
      }
    }

    productMap.set(key, {
      name: productName,
      description: `Premium quality used ${fuelType} engine. Brand: ${brand}. Engine Code: ${engineCode}. All units are thoroughly tested, cleaned, and come with a warranty. Suitable for professional workshop installation.`,
      brand: brand,
      fuel_type: fuelType,
      engine_code: engineCode,
      price: 1200 + Math.floor(Math.random() * 2500), // Slightly higher prices for engines
      mileage: 40000 + Math.floor(Math.random() * 120000),
      year: 2014 + Math.floor(Math.random() * 9),
      condition: 'Tested - Excellent',
      compatibility: [brand],
      images: [`/images/engines/${file}`],
      category_id: ENGINE_CATEGORY_ID,
      availability: true
    });
  }

  const products = Array.from(productMap.values());
  let sql = '-- SQL Script for manual Engine products upload\n';
  sql += '-- Delete existing engines to avoid duplicates\n';
  sql += `DELETE FROM public.products WHERE category_id = '${ENGINE_CATEGORY_ID}';\n\n`;

  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    sql += 'INSERT INTO public.products (name, description, brand, fuel_type, engine_code, price, mileage, year, condition, compatibility, images, category_id, availability)\nVALUES\n';
    
    const values = batch.map(p => {
      const compatibility = `ARRAY[${p.compatibility.map(c => `'${escapeSql(c)}'`).join(', ')}]`;
      const images = `ARRAY[${p.images.map(img => `'${escapeSql(img)}'`).join(', ')}]`;
      return `('${escapeSql(p.name)}', '${escapeSql(p.description)}', '${escapeSql(p.brand)}', '${p.fuel_type}', '${escapeSql(p.engine_code)}', ${p.price}, ${p.mileage}, ${p.year}, '${p.condition}', ${compatibility}, ${images}, '${p.category_id}', ${p.availability})`;
    });

    sql += values.join(',\n') + ';\n\n';
  }

  fs.writeFileSync('engines-upload.sql', sql);
  console.log(`Generated SQL for ${products.length} unique engines in engines-upload.sql`);
}

main();
