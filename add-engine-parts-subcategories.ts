import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ENGINE_PARTS_ID = '8d457139-63c9-44a5-9533-6f4adda1efde';

const subCategories = [
  { name: 'Low Engines', slug: 'low-engines', parent_id: ENGINE_PARTS_ID },
  { name: 'Cylinder Heads', slug: 'cylinder-heads', parent_id: ENGINE_PARTS_ID },
  { name: 'Other Engine Parts', slug: 'other-engine-parts', parent_id: ENGINE_PARTS_ID },
  { name: 'Injections', slug: 'injections', parent_id: ENGINE_PARTS_ID },
  { name: 'Various', slug: 'various', parent_id: ENGINE_PARTS_ID },
  { name: 'Collectors', slug: 'collectors', parent_id: ENGINE_PARTS_ID },
  { name: 'Beams - Calculators', slug: 'beams-calculators', parent_id: ENGINE_PARTS_ID },
  { name: 'Crankshafts - Connecting Rods', slug: 'crankshafts-connecting-rods', parent_id: ENGINE_PARTS_ID },
  { name: 'Sensors Probes', slug: 'sensors-probes', parent_id: ENGINE_PARTS_ID },
  { name: 'Injectors Diesel', slug: 'injectors-diesel', parent_id: ENGINE_PARTS_ID },
  { name: 'Injectors Essence', slug: 'injectors-essence', parent_id: ENGINE_PARTS_ID },
  { name: 'Injection Pump', slug: 'injection-pump', parent_id: ENGINE_PARTS_ID },
  { name: 'Consumables', slug: 'consumables', parent_id: ENGINE_PARTS_ID },
  { name: 'Various Opportunities', slug: 'various-opportunities', parent_id: ENGINE_PARTS_ID },
];

async function main() {
  console.log('Upserting sub-categories for Engine Parts...');

  const { data, error } = await supabase
    .from('categories')
    .upsert(subCategories, { onConflict: 'slug' });

  if (error) {
    console.error('Error upserting categories:', error);
  } else {
    console.log('Successfully upserted sub-categories:', data);
  }
}

main();
