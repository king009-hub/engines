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
  const { data: products } = useCartProducts(productIds);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const p = products?.find(x => x.id === item.product_id);
      return sum + (p ? Number(p.price) * item.quantity : 0);
    }, 0);
  }, [items, products]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    const init = async () => {
      // If products are not in cache, wait for them.
      // But we can check if they ARE in cache already.
      if (!products) return; 
      
      if (products.length === 0) {
        setLoading(false);
        return;
      }

      // Optimization: Check if we already have a clientSecret for these items
      const currentItemsHash = JSON.stringify(items.sort((a, b) => a.product_id.localeCompare(b.product_id)));
      if (clientSecret && (window as any)._lastItemsHash === currentItemsHash) {
        setLoading(false);
        return;
      }

      try {
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
        
        console.log('[Checkout] Creating payment intent for amount:', total);
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
          (window as any)._lastItemsHash = currentItemsHash;
        } else {
          throw new Error('No clientSecret returned from function');
        }
      } catch (e: any) {
        console.error('Failed to create payment intent:', e);
        toast.error('Payment initialization failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [items, products, navigate, total, clientSecret]);

  const stripePromise = useMemo(() => {
    if (!stripePk) return null;
    return loadStripe(stripePk);
  }, []);

  return (
    <Layout title="Checkout">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-black uppercase mb-6">Checkout</h1>
        {!stripePk && (
          <div className="p-4 border border-destructive text-destructive rounded mb-6">
            Missing VITE_STRIPE_PUBLISHABLE_KEY in your environment. Add it to proceed.
          </div>
        )}
        {loading || !clientSecret || !stripePromise ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing payment...
          </div>
        ) : (
          <Elements options={{ clientSecret }} stripe={stripePromise}>
            <CheckoutForm amount={total} />
          </Elements>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;

