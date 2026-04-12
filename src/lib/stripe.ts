import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

export const getStripe = async () => {
  try {
    const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (envKey) return loadStripe(envKey);

    const fromView = await supabase.from('public_stripe_config').select('stripe_public_key').maybeSingle();
    if (fromView.data?.stripe_public_key) return loadStripe(fromView.data.stripe_public_key);
    if (fromView.error && fromView.error.message) console.error('[StripeUtil] View read error:', fromView.error.message);

    const { data, error } = await supabase.from('app_settings').select('stripe_public_key').maybeSingle();

    if (error) {
      console.error('[StripeUtil] Database error:', error);
      throw error;
    }

    if (!data?.stripe_public_key) throw new Error('Stripe is not configured. Please contact the administrator.');

    return loadStripe(data.stripe_public_key);
  } catch (err) {
    console.error('Error loading Stripe:', err);
    throw err;
  }
};
