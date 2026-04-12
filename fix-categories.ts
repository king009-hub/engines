import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// The main Engine Parts category ID
const ENGINE_PARTS_ID = '8d457139-63c9-44a5-9533-6f4adda1efde';

// List of slugs that should be subcategories of Engine Parts
const enginePartsSubcategorySlugs = [
  'low-engines',
  'cylinder-heads',
  'other-engine-parts',
  'injections',
  'various',
  'collectors',
  'beams-calculators',
  'crankshafts-connecting-rods',
  'sensors-probes',
  'injectors-diesel',
  'injectors-essence',
  'injection-pump',
  'consumables',
  'various-opportunities'
];

async function fixCategories() {
  console.log('Starting category fix...');
  
  // Fetch all categories to check current state
  const { data: categories, error: fetchError } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id');
    
  if (fetchError) {
    console.error('Error fetching categories:', fetchError);
    return;
  }
  
  console.log(`Found ${categories.length} categories.`);
  
  let updatedCount = 0;
  
  for (const category of categories) {
    if (enginePartsSubcategorySlugs.includes(category.slug)) {
      if (category.parent_id !== ENGINE_PARTS_ID) {
        console.log(`Fixing '${category.name}' (${category.slug}) -> setting parent to Engine Parts`);
        
        const { error: updateError } = await supabase
          .from('categories')
          .update({ parent_id: ENGINE_PARTS_ID })
          .eq('id', category.id);
          
        if (updateError) {
          console.error(`Failed to update ${category.name}:`, updateError);
        } else {
          updatedCount++;
        }
      } else {
        console.log(`'${category.name}' is already correctly linked.`);
      }
    }
  }
  
  console.log(`Finished fixing categories. Updated ${updatedCount} categories.`);
}

fixCategories();
