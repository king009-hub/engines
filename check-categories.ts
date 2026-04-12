
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id');
  
  if (catError) {
    console.error(catError);
    return;
  }
  
  const { data: counts, error: countError } = await supabase
    .from('products')
    .select('category_id');
  
  if (countError) {
    console.error(countError);
    return;
  }

  const categoryCounts: Record<string, number> = {};
  counts.forEach(p => {
    if (p.category_id) {
      categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
    }
  });
  
  const result = categories.map(cat => ({
    ...cat,
    product_count: categoryCounts[cat.id] || 0
  }));
  
  console.log(JSON.stringify(result, null, 2));
}

checkCategories();
