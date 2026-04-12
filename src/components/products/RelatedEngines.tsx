import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { useTranslation } from 'react-i18next';

interface RelatedEnginesProps {
  products: Product[];
}

const RelatedEngines = ({ products }: RelatedEnginesProps) => {
  const { t } = useTranslation();
  if (!products || !products.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-foreground">{t('products.related_products')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default RelatedEngines;
