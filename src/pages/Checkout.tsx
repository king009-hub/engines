import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/hooks/useCart';
import { useCartProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

function CheckoutForm({ amount, email, phone, address, items, products }: { amount: number, email: string, phone: string, address: string, items: any[], products: any[] }) {
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
      <div className="pt-4 border-t border-border">
        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
          <ShieldCheck className="h-3 w-3 text-primary" /> Secure 256-bit SSL Payment
        </p>
        <Button type="submit" className="w-full font-bold uppercase py-6" disabled={!stripe || submitting}>
          {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('cart.checkout')}...</> : t('cart.checkout')}
        </Button>
        <p className="text-sm text-muted-foreground text-center mt-2 font-bold uppercase">Total: ${Math.round(amount)}</p>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border text-[10px] font-bold uppercase tracking-tight text-center space-y-2">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1 text-green-600">✅ 60-Day Warranty</span>
            <span className="flex items-center gap-1 text-blue-600">📦 Ships within 48hrs</span>
          </div>
          <div className="pt-2 border-t border-border/50">
            <a href="https://wa.me/16122931250" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#25D366] hover:underline">
              💬 Questions? Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}

const Checkout = () => {
  const { user, isAdmin } = useAuth();
  const { items } = useCart();
  const productIds = items.map(i => i.product_id);
  const { data: products, isLoading: isProductsLoading, error: productsError } = useCartProducts(productIds);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripePk, setStripePk] = useState<string | null>(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null);
  
  // Customer info state
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [postalCode, setPostalCode] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fetch dynamic Stripe key from database and initialize Stripe
  useEffect(() => {
    let isMounted = true;
    async function fetchStripeKey() {
      try {
        // Start loading products and settings in parallel
        const { data, error } = await supabase.from('app_settings').select('stripe_public_key').maybeSingle();
        if (isMounted && data?.stripe_public_key) {
          console.log('[Checkout] Using dynamic Stripe key from database');
          setStripePk(data.stripe_public_key);
        }
      } catch (err) {
        console.error('[Checkout] Failed to fetch dynamic Stripe key:', err);
      }
    }
    fetchStripeKey();
    return () => { isMounted = false; };
  }, []);

  const total = useMemo(() => {
    if (!products || !items.length) return 0;
    return items.reduce((sum, item) => {
      const p = products.find(x => x.id === item.product_id);
      return sum + (p ? Number(p.price) * item.quantity : 0);
    }, 0);
  }, [items, products]);

  // Use a singleton for stripePromise to avoid re-initializing
  const stripePromise = useMemo(() => {
    if (!stripePk) return null;
    return loadStripe(stripePk);
  }, [stripePk]);

  // Pre-initialize payment intent if we have user data (Optional optimization)
  // For now, let's just make the existing transition faster by optimizing the function call.

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If cart is empty, redirect back
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // 1. Check for Stripe configuration
    if (!stripePk) {
      setError('Stripe is not configured correctly. Please check your Stripe Control Center in Admin.');
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
        address: `${streetAddress}, ${city}, ${postalCode}, ${country}`
      };
      
      console.log('[Checkout] Requesting payment intent...');
      
      const { data, error: functionError } = await supabase.functions.invoke('create-payment-intent', {
        body: payload
      });
      
      if (functionError) {
        console.error('[Checkout] Function error:', functionError);
        throw new Error(functionError.message || 'Failed to initialize payment intent');
      }
      
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
          // ... (keep error state as is)
          <div className="p-6 border-2 border-destructive bg-destructive/5 rounded-xl text-center space-y-4">
            <div className="bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-destructive font-black uppercase text-sm tracking-wider">{error}</p>
              {error.includes('Stripe API configuration') && isAdmin && (
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mt-4 text-left">
                  <p className="text-xs font-bold text-primary uppercase mb-1">Admin Action Required:</p>
                  <p className="text-xs text-muted-foreground mb-3">Your Stripe Secret Key is either invalid or expired. Please update it in the control center.</p>
                  <Button 
                    onClick={() => navigate('/admin/stripe-config')} 
                    variant="default" 
                    size="sm"
                    className="w-full font-bold uppercase text-[10px]"
                  >
                    Go to Stripe Control Center
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={() => window.location.reload()} variant="outline" className="font-bold uppercase">
                Try Again
              </Button>
              <Button onClick={() => navigate('/cart')} className="font-bold uppercase">
                Back to Cart
              </Button>
            </div>
          </div>
        ) : !showPayment ? (
          <div className="space-y-6">
            {/* Order Summary Box */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Order Summary
              </h3>
              <div className="space-y-2">
                {products?.map((product) => {
                  const item = items.find(i => i.product_id === product.id);
                  if (!item) return null;
                  return (
                    <div key={product.id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {product.name} <span className="font-bold">x{item.quantity}</span>
                      </span>
                      <span className="font-bold">${Math.round(Number(product.price) * item.quantity)}</span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-border flex justify-between items-center font-black uppercase text-sm">
                  <span>Total</span>
                  <span className="text-primary">${Math.round(total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold uppercase mb-4 tracking-tight">Customer Information</h2>
              <form onSubmit={handleStartPayment} className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-primary font-bold uppercase tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Auto-Registration Enabled
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    We will automatically create a secure account for you using your email address so you can track your order.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase text-primary tracking-wider">Shipping Address</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Street Address</label>
                    <input 
                      type="text" 
                      required 
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="123 Engine St"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">City</label>
                      <input 
                        type="text" 
                        required 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Motor City"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Postal Code</label>
                      <input 
                        type="text" 
                        required 
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Country</label>
                    <select 
                      required 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {["United States", "United Kingdom", "Canada", "Australia", "France", "Germany", "Spain", "Italy", "Netherlands", "Belgium", "Switzerland", "Sweden", "Norway", "Denmark", "Finland", "Ireland", "Portugal", "Austria", "Poland", "Greece"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border mt-6">
                  <Button type="submit" className="w-full font-bold uppercase py-6" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : 'Proceed to Payment'}
                  </Button>
                  <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-green-500" /> Your information is safe and encrypted
                  </p>
                </div>
              </form>
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Order Details</p>
                  <p className="text-sm font-bold">{items.length} Product(s)</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPayment(false)} className="text-xs font-bold uppercase">Edit Info</Button>
              </div>
              
              <div className="space-y-3 pt-3 border-t border-primary/10">
                {products?.map((product) => {
                  const item = items.find(i => i.product_id === product.id);
                  if (!item) return null;
                  return (
                    <div key={product.id} className="flex justify-between items-start text-xs">
                      <div className="max-w-[70%]">
                        <p className="font-bold leading-tight">{product.name}</p>
                        <p className="text-muted-foreground mt-0.5">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-bold">${Math.round(Number(product.price) * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Elements key={clientSecret} options={{ clientSecret }} stripe={stripePromise}>
              <CheckoutForm 
                amount={total} 
                email={email} 
                phone={phone} 
                address={`${streetAddress}, ${city}, ${postalCode}, ${country}`} 
                items={items}
                products={products || []}
              />
            </Elements>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;

