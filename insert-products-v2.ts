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
  
  console.log('Signing in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@admin.com',
    password: 'password',
  });

  if (authError) {
    console.log('Login failed, trying to register...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@admin.com',
      password: 'password',
    });
    
    if (signUpError) {
      console.error('Registration error:', signUpError.message);
      return;
    }
    
    console.log('Successfully registered admin user. ID:', signUpData.user?.id);
    fs.writeFileSync('new-admin-id.txt', signUpData.user?.id || '');
    return;
  }

  console.log('Successfully signed in. Starting insertion...');

  const products = JSON.parse(fs.readFileSync('generated-products.json', 'utf8'));
  const batchSize = 50;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const { error } = await supabase.from('products').insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
    } else {
      console.log(`Successfully inserted batch ${i / batchSize + 1}/${Math.ceil(products.length / batchSize)}`);
    }
  }

  console.log('Finished processing.');
}

main();
