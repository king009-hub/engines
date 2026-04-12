import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/products/ProductGrid';
import Testimonials from '@/components/common/Testimonials';
import { useProducts } from '@/hooks/useProducts';

const Index = () => {
  const { t, i18n } = useTranslation();
  
  // Memoize filters to prevent re-fetch loops
  const filters = useMemo(() => ({ 
    per_page: 16,
    sort: 'newest' as const
  }), []);

  const { data, isLoading, error } = useProducts(filters);

  console.log('[Index] Rendering, language:', i18n.language);
  if (isLoading) console.log('[Index] Products are loading...');
  if (error) console.error('[Index] Error loading products:', error);
  if (data) console.log('[Index] Products loaded:', data.products.length);

  return (
    <Layout title={t('home.hero_title')}>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h2 className="text-xl md:text-2xl font-black uppercase text-foreground mb-6 md:mb-8">{t('home.latest_products')}</h2>

          <ProductGrid products={data?.products || []} loading={isLoading} />
        </div>
        
        <Testimonials />
      </div>
    </Layout>
  );
};

export default Index;
