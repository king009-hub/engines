import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// IDs
const ENGINE_PARTS_ID = '8d457139-63c9-44a5-9533-6f4adda1efde';

async function remapEngineParts() {
  console.log('Fetching all products currently assigned to the main "Engine Parts" category...');
  
  // Get all products currently assigned to the main category
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, description, category_id')
    .eq('category_id', ENGINE_PARTS_ID);
    
  if (prodError) {
    console.error('Error fetching products:', prodError);
    return;
  }
  
  console.log(`Found ${products.length} products directly assigned to Engine Parts.`);
  
  if (products.length === 0) {
    console.log('No products to remap. They might be assigned to Engines or elsewhere.');
    
    // Check if parts are assigned to Engines by mistake
    const { data: enginesData } = await supabase
      .from('products')
      .select('id, name, images, category_id');
      
    if (enginesData && enginesData.length > 0) {
        console.log(`Checking all ${enginesData.length} products to find miscategorized ones...`);
        const subCatMapping: Record<string, string> = {
            'low-engines': '3c55de22-a700-4633-8a3e-c18e4b6bf3ee',
            'cylinder-heads': 'ad7980f0-a423-4e77-a752-c940223570dc', // Culasses
            'injections': '6b147f3a-b5d7-4a56-b030-fc6df75373f8', // Injectors
            'various-opportunities': 'bc55a974-f629-42a6-a189-fc4fbe5fea82',
        };
        
        const updates = [];
        for (const p of enginesData) {
            // Very simple heuristic to find products that should be in subcategories
            const name = p.name.toLowerCase();
            const imgPath = p.images?.[0]?.toLowerCase() || '';
            
            if (name.includes('inject') || imgPath.includes('inject')) {
                updates.push({ id: p.id, category_id: subCatMapping['injections'] });
            } else if (name.includes('cylinder') || name.includes('culasse') || imgPath.includes('culasse')) {
                updates.push({ id: p.id, category_id: subCatMapping['cylinder-heads'] });
            } else if (name.includes('low') || name.includes('bas') || imgPath.includes('bas moteur')) {
                updates.push({ id: p.id, category_id: subCatMapping['low-engines'] });
            }
        }
        
        console.log(`Found ${updates.length} products that should be moved to subcategories.`);
        
        // Execute updates
        let successCount = 0;
        for (const update of updates) {
            const { error } = await supabase.from('products').update({ category_id: update.category_id }).eq('id', update.id);
            if (!error) successCount++;
        }
        console.log(`Successfully updated ${successCount} products.`);
    } else {
        return;
    }
  }
}

remapEngineParts();