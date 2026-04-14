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

function CheckoutForm({ amount, email, phone, address }: { amount: number, email: string, phone: string, address: string }) {
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
          payment_method_data: {
            billing_details: {
              email: email,
              phone: phone,
            }
          }
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
  }, [stripe, elements, email, phone]);

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
  const { user } = useAuth();
  const { items } = useCart();
  const productIds = items.map(i => i.product_id);
  const { data: products, isLoading: isProductsLoading, error: productsError } = useCartProducts(productIds);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Customer info state
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPayment, setShowPayment] = useState(false);

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

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If cart is empty, redirect back
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // 1. Check for Stripe configuration
    if (!stripePk) {
      setError('Stripe is not configured correctly. Please check your environment variables.');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const payload = {
        items: items.map(it => ({
          product_id: it.product_id,
          quantity: it.quantity
        })),
        email,
        phone,
        address
      };
      
      console.log('[Checkout] Requesting payment intent...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
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
        ) : !showPayment ? (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold uppercase mb-4 tracking-tight">Customer Information</h2>
            <form onSubmit={handleStartPayment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Shipping Address</label>
                <textarea 
                  required 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="123 Engine St, Motor City, 12345"
                />
              </div>
              
              <div className="pt-4 border-t border-border mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold uppercase text-sm">Total Amount</span>
                  <span className="text-xl font-black text-primary">${Math.round(total)}</span>
                </div>
                
                <Button type="submit" className="w-full font-bold uppercase py-6" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : 'Proceed to Payment'}
                </Button>
              </div>
            </form>
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Selected Items</p>
                <p className="text-sm font-bold">{items.length} Product(s)</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPayment(false)} className="text-xs font-bold uppercase">Edit Info</Button>
            </div>
            
            <Elements key={clientSecret} options={{ clientSecret }} stripe={stripePromise}>
              <CheckoutForm amount={total} email={email} phone={phone} address={address} />
            </Elements>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;

