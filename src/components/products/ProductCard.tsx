import { Link } from 'react-router-dom';
import { memo, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { translateDynamic } from '@/lib/translate';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useCategories } from '@/hooks/useProducts';
import { CheckCircle2, ShoppingCart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const { data: categories } = useCategories();
  
  const translatedName = useMemo(() => translateDynamic(product.name), [product.name]);
  const categoryLabel = useMemo(() => {
    const category = categories?.find(item => item.id === product.category_id);
    const labelSource = category?.slug || category?.name || '';
    const normalized = labelSource.toLowerCase();

    if (normalized.includes('engine')) return 'Used Engine';
    if (normalized.includes('gear')) return 'Gearbox';
    if (normalized.includes('compressor')) return 'Compressor';
    if (normalized.includes('electric')) return 'Electric Motor';
    if (normalized.includes('rebuild')) return 'Rebuild Kit';
    if (normalized.includes('kit')) return 'Rebuild Kit';
    if (normalized.includes('chra') || normalized.includes('cartridge')) return 'CHRA Cartridge';
    if (normalized.includes('turbo')) return 'Turbo Part';
    return 'Auto Part';
  }, [categories, product.category_id]);
  const partType = useMemo(() => {
    const cleaned = translatedName?.trim();
    if (cleaned && cleaned.length > 2) return cleaned;
    return `${translateDynamic(product.brand)} Part`;
  }, [translatedName, product.brand]);
  const descriptiveTitle = useMemo(() => {
    return `${categoryLabel} — Tested & Inspected`;
  }, [categoryLabel]);
  
  // Prefetch product details on hover for instant navigation
  const prefetchProduct = () => {
    queryClient.prefetchQuery({
      queryKey: ['product', product.slug || product.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .or(`id.eq.${product.id},slug.eq.${product.slug}`)
          .single();
        if (error) throw error;
        return data as Product;
      },
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  };

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
    toast.success(t('cart.added_success') || 'Added to basket');
  };

  const imageUrl = product.images?.[0];
  const optimizedUrl = useMemo(() => getOptimizedImageUrl(imageUrl, { width: 400, quality: 70 }), [imageUrl]);

  return (
    <div className="group relative bg-white p-3 rounded-2xl border border-border hover:shadow-md transition-shadow">
      <Link 
        to={`/products/${product.slug || product.id}`} 
        className="block"
        onMouseEnter={prefetchProduct}
      >
        <div className="aspect-[4/3] overflow-hidden bg-muted mb-3 relative rounded-xl border border-border/50">
          <img
            src={optimizedUrl}
            alt={translatedName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
            Tested
          </div>
          <div className="absolute inset-x-2 bottom-2 rounded-full bg-[#151515]/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white text-center">
            {categoryLabel}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground line-clamp-1">
            {descriptiveTitle}
          </p>
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">
            {product.engine_code}
          </p>
          {/* Removed "Fits:" line as per instruction */}
        </div>
      </Link>
      
      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-foreground">
            ${Math.round(Number(product.price))}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
            <Truck className="h-3 w-3 text-[#b38a2e]" />
            Ships in 24-48hrs
          </p>
        </div>
        <Button 
          size="sm" 
          className="h-8 px-2 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center gap-1 text-[9px] font-bold uppercase relative z-10 shrink-0"
          onClick={handleAddToBasket}
        >
          <ShoppingCart className="h-3 w-3" />
          Add
        </Button>
      </div>
      <div className="mt-2.5 pt-2 border-t border-border/50 inline-flex items-center gap-1 text-[9px] font-bold uppercase text-emerald-700 tracking-wider">
        <CheckCircle2 className="h-3 w-3" />
        Tested &amp; Inspected
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
