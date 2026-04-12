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

  // Using the publishable key. 
  // IMPORTANT: For this to work, RLS must allow inserts by the role associated with this key,
  // or you must have a valid session.
  // Since this is a pair programming task, I'll assume I can perform these operations.
  const supabase = createClient(url, key);
  
  const products = JSON.parse(fs.readFileSync('prepared-products.json', 'utf8'));
  console.log(`Starting insertion of ${products.length} products...`);

  const batchSize = 100;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const { error } = await supabase.from('products').insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
      // If RLS fails, we might need a different approach (e.g., service role key)
      break; 
    } else {
      console.log(`Successfully inserted batch ${i / batchSize + 1}/${Math.ceil(products.length / batchSize)}`);
    }
  }

  console.log('Finished processing.');
}

main();
