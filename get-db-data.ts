import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function main() {
  const env = fs.readFileSync('.env', 'utf-8');
  const url = env.match(/VITE_SUPABASE_URL="(.*)"/)?.[1];
  const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*)"/)?.[1];
  
  if (!url || !key) {
    console.error('Supabase URL or Key not found in .env');
    return;
  }

  const supabase = createClient(url, key);
  
  const { data: categories, error: catError } = await supabase.from('categories').select('id, name, slug');
  const { data: brands, error: brandError } = await supabase.from('brands').select('id, name, slug');
  
  if (catError || brandError) {
    console.error('Error fetching data:', catError || brandError);
    return;
  }

  console.log(JSON.stringify({ categories, brands }, null, 2));
}

main();
