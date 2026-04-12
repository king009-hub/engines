import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/hooks/useCart';
import { useCartProducts } from '@/hooks/useProducts';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        }
      });
      if (error) {
        console.error('Stripe confirmPayment error:', error);
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  }, [stripe, elements]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe || submitting}>
        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('cart.checkout')}...</> : t('cart.checkout')}
      </Button>
      <p className="text-sm text-muted-foreground text-center">Total: ${Math.round(amount)}</p>
    </form>
  );
}

const Checkout = () => {
  const { items } = useCart();
  const productIds = items.map(i => i.product_id);
  const { data: products, isLoading: isProductsLoading, error: productsError } = useCartProducts(productIds);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const total = useMemo(() => {
    if (!products || !items.length) return 0;
    return items.reduce((sum, item) => {
      const p = products.find(x => x.id === item.product_id);
      return sum + (p ? Number(p.price) * item.quantity : 0);
    }, 0);
  }, [items, products]);

  const stripePromise = useMemo(() => {
    if (!stripePk) {
      console.error('[Checkout] Missing Stripe Publishable Key');
      return null;
    }
    return loadStripe(stripePk);
  }, []);

  useEffect(() => {
    // If cart is empty, redirect back
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    const init = async () => {
      // 1. Wait for products metadata to load from database
      if (isProductsLoading) return;
      
      // 2. Check if products data actually returned anything
      if (!products || products.length === 0) {
        if (productsError) {
          setError(`Database error: ${productsError.message || 'Failed to fetch products'}`);
        } else {
          setError('Could not find products in your cart. They might have been removed.');
        }
        setLoading(false);
        return;
      }

      // 3. Check for Stripe configuration
      if (!stripePk) {
        setError('Stripe is not configured correctly. Please check your environment variables.');
        setLoading(false);
        return;
      }

      // 4. Optimization: Skip re-creation if items haven't changed
      const currentItemsHash = JSON.stringify(items.sort((a, b) => a.product_id.localeCompare(b.product_id)));
      if (clientSecret && (window as any)._lastItemsHash === currentItemsHash) {
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        const payload = {
          items: items.map(it => {
            const p = products.find(x => x.id === it.product_id);
            return {
              name: p?.name,
              price: p ? Number(p.price) : 0,
              quantity: it.quantity
            };
          })
        };
        
        console.log('[Checkout] Requesting payment intent for:', total);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Please login to complete your purchase.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
          (window as any)._lastItemsHash = currentItemsHash;
        } else {
          throw new Error('No clientSecret returned from the server.');
        }
      } catch (e: any) {
        console.error('[Checkout] Initialization failed:', e);
        setError(e.message || 'Failed to initialize payment system.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [items, products, isProductsLoading, productsError, navigate, total, clientSecret]);

  return (
    <Layout title="Checkout">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-black uppercase mb-6 tracking-tighter">Checkout</h1>
        
        {error ? (
          <div className="p-6 border-2 border-destructive bg-destructive/5 rounded-xl text-center space-y-4">
            <p className="text-destructive font-bold uppercase text-sm tracking-wider">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline" className="font-bold uppercase">
                Try Again
              </Button>
              <Button onClick={() => navigate('/cart')} className="font-bold uppercase">
                Back to Cart
              </Button>
            </div>
          </div>
        ) : loading || !clientSecret || !stripePromise ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-black uppercase text-lg tracking-tighter">Preparing payment...</p>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Securing connection to Stripe</p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Elements options={{ clientSecret }} stripe={stripePromise}>
              <CheckoutForm amount={total} />
            </Elements>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;

