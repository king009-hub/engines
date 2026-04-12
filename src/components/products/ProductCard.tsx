import { Link, useNavigate } from 'react-router-dom';
import { memo, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { translateDynamic } from '@/lib/translate';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  // Memoize translated values to prevent re-translation on every hover/render
  const translatedName = useMemo(() => translateDynamic(product.name), [product.name]);
  const compatibility = useMemo(() => 
    product.compatibility?.map(c => translateDynamic(c)).join(' - ') || translateDynamic(product.brand),
    [product.compatibility, product.brand]
  );

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

  const imageUrl = product.images?.[0] || '/placeholder.svg';
  // Use properly encoded URL to prevent parsing errors
  const encodedImageUrl = encodeURI(imageUrl).replace(/%25/g, '%');
  // Try to use webp version if it exists (assuming it was generated)
  const webpUrl = encodedImageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  return (
    <div className="group relative">
      <Link 
        to={`/products/${product.slug || product.id}`} 
        className="block"
        onMouseEnter={prefetchProduct}
      >
        {/* Image with Skeleton Placeholder and Fixed Aspect Ratio */}
        <div className="aspect-[4/3] overflow-hidden bg-muted mb-3 relative rounded-lg">
          <picture>
            <source srcSet={webpUrl} type="image/webp" />
            <img
              src={encodedImageUrl}
              alt={translatedName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>

        {/* Info - minimal like reference */}
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground uppercase tracking-wide line-clamp-1">
            {compatibility}
          </p>
          <p className="text-sm font-semibold text-primary line-clamp-1">
            {product.engine_code}
          </p>
        </div>
      </Link>
      
      <div className="flex items-center justify-between mt-1">
        <Link to={`/products/${product.slug || product.id}`} className="block">
          <p className="text-base font-bold text-foreground">
            ${Math.round(Number(product.price))}
          </p>
        </Link>
        <Button 
          size="sm" 
          className="h-8 px-2 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center gap-1 text-[10px] font-bold uppercase relative z-10"
          onClick={handleAddToBasket}
        >
          <ShoppingCart className="h-3 w-3" />
          {t('products.add_to_basket')}
        </Button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
