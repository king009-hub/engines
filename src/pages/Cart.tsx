import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/hooks/useCart';
import { useCartProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '@/lib/translate';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Fetch only products that are actually in the user's cart
  const productIds = items.map(i => i.product_id);
  const { data: cartProducts, isLoading: isProductsLoading } = useCartProducts(productIds);

  const getProduct = useCallback((id: string) => {
    return cartProducts?.find(p => p.id === id);
  }, [cartProducts]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = getProduct(item.product_id);
      return sum + (product ? Number(product.price) * item.quantity : 0);
    }, 0);
  }, [items, getProduct]);

  const navigate = useNavigate();

  const handleCheckout = useCallback(() => {
    if (items.length === 0) return;
    
    // Safety check: ensure all items have matching product data before proceeding
    const missingProducts = items.filter(item => !getProduct(item.product_id));
    
    if (missingProducts.length > 0) {
      console.warn('[Cart] Some product data is missing. Cleaning up cart.');
      toast({
        title: "Cart Update",
        description: "Some items in your cart are no longer available and have been removed.",
        variant: "destructive"
      });
      // Remove invalid items
      missingProducts.forEach(p => removeItem(p.product_id));
      return;
    }

    navigate('/checkout');
  }, [items, getProduct, navigate, removeItem, toast]);

  // Pre-fetch checkout page components when user is in cart
  useEffect(() => {
    if (items.length > 0) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/checkout';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [items.length]);

  if (items.length === 0) {
    return (
      <Layout title={t('cart.title')}>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('cart.empty')}</h2>
          <p className="text-muted-foreground mb-6">{t('home.hero_subtitle')}</p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/products">{t('cart.continue_shopping')}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // If auto-checkout is in progress, we show the Cart normally but with a loading state on the checkout button
  // This makes the transition feel more "instant" and less like a separate "bridge" page.

  return (
    <Layout title={t('cart.title')}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-black uppercase text-foreground mb-6">{t('cart.title')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const product = getProduct(item.product_id);
              if (!product) return null;
              const translatedName = translateDynamic(product.name);
              return (
                <div key={item.product_id} className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-4 flex-1">
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={translatedName}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${product.slug || product.id}`} className="font-bold text-foreground hover:text-primary block truncate sm:whitespace-normal">
                        {translatedName}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{t('products.engine_code')}: {product.engine_code}</p>
                      <p className="text-primary font-bold mt-1">${Math.round(Number(product.price))}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5 hover:bg-muted rounded border border-border sm:border-0">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5 hover:bg-muted rounded border border-border sm:border-0">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product_id)} className="p-2 text-destructive hover:bg-destructive/10 rounded ml-2" title={t('cart.remove')}>
                      <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-6 h-fit">
            <h2 className="font-bold uppercase text-lg mb-4 text-foreground">{t('cart.summary')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="font-bold text-foreground">${Math.round(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.shipping')}</span>
                <span className="text-foreground">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">{t('cart.total')}</span>
                  <span className="text-primary">${Math.round(total)}</span>
                </div>
              </div>
            </div>
            <Button 
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase"
              onClick={handleCheckout}
              disabled={isProductsLoading}
            >
              {isProductsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading items...
                </>
              ) : (
                t('cart.checkout')
              )}
            </Button>
            <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground" onClick={clearCart}>
              {t('cart.remove')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
