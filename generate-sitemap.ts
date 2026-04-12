import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://enginemarkets.com';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const staticPages = [
  '',
  '/products',
  '/contact',
  '/login',
  '/register',
  '/wishlist',
  '/cart'
];

async function generateSitemap() {
  console.log('Generating sitemap...');
  const urls: string[] = [];

  // 1. Add static pages
  staticPages.forEach(page => {
    urls.push(`${BASE_URL}${page}`);
  });

  // 2. Fetch Categories
  const { data: categories } = await supabase.from('categories').select('slug');
  if (categories) {
    categories.forEach(cat => {
      urls.push(`${BASE_URL}/products?category=${cat.slug}`);
    });
  }

  // 3. Fetch Brands
  const { data: brands } = await supabase.from('brands').select('name');
  if (brands) {
    brands.forEach(brand => {
      urls.push(`${BASE_URL}/products?brand=${encodeURIComponent(brand.name)}`);
    });
  }

  // 4. Fetch Products
  console.log('Fetching products...');
  let allProducts: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('slug, id')
      .range(from, from + step - 1);

    if (productError) {
      console.error('Error fetching products:', productError);
      hasMore = false;
    } else if (products && products.length > 0) {
      allProducts = [...allProducts, ...products];
      if (products.length < step) {
        hasMore = false;
      } else {
        from += step;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`Found ${allProducts.length} total products.`);
  allProducts.forEach(product => {
    if (product.slug) {
      urls.push(`${BASE_URL}/products/${product.slug}`);
    } else {
      urls.push(`${BASE_URL}/products/${product.id}`);
    }
  });

  // 5. Add category + brand combinations (SEO gold)
  console.log('Generating category + brand combinations...');
  if (categories && brands) {
    categories.forEach(cat => {
      // Use common popular brands instead of all brands to keep sitemap manageable
      const topBrands = ['Renault', 'Nissan', 'Mercedes', 'Volvo', 'Jeep', 'Toyota', 'VW', 'BMW', 'Audi', 'Fiat', 'Ford', 'Opel', 'Peugeot', 'Citroen', 'Mazda'];
      topBrands.forEach(brand => {
        urls.push(`${BASE_URL}/products?category=${cat.slug}&brand=${encodeURIComponent(brand)}`);
      });
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.replace(/&/g, '&amp;')}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === BASE_URL ? '1.0' : url.includes('/products/') ? '0.7' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log(`Successfully generated sitemap.xml with ${urls.length} URLs in public/sitemap.xml`);
}

generateSitemap().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
