// create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log(`[create-checkout-session] Received request: ${req.method}`)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get dynamic Stripe settings from database
    const { data: settings, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('*')
      .single()

    if (settingsError || !settings?.stripe_secret_key) {
      console.error(`[create-checkout-session] Settings error:`, settingsError)
      throw new Error('Stripe is not configured in admin panel')
    }

    const stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 2. Get user from auth header
    const authHeader = req.headers.get('Authorization')
    let user = null
    if (authHeader) {
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
      if (authUser) user = authUser
    }
    
    const { items, success_url, cancel_url } = await req.json()
    console.log(`[create-checkout-session] Processing ${items.length} items for user ${user?.email || 'anonymous'}`)

    // 3. Create line items
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: (settings.currency || 'USD').toLowerCase(),
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: user?.email,
      success_url: success_url || `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/checkout/cancel`,
      metadata: {
        user_id: user?.id || 'anonymous',
      }
    })

    // 5. Log pending payment in database
    const totalAmount = items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)
    await supabaseClient.from('payments').insert({
      user_id: user?.id,
      email: user?.email || 'anonymous',
      amount: totalAmount,
      currency: settings.currency || 'USD',
      status: 'pending',
      stripe_session_id: session.id,
    })

    console.log(`[create-checkout-session] Session created: ${session.id}`)
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.log(`[create-checkout-session] Error:`, error.message)
    
    // Sanitize error message
    let message = error.message || String(error);
    message = message.replace(/(sk_live_[a-zA-Z0-9]{20,})|(sk_test_[a-zA-Z0-9]{20,})/g, '[REDACTED]');
    if (message.includes('API key') || message.includes('sk_live_') || message.includes('sk_test_') || message.includes('REDACTED')) {
      message = 'Invalid Stripe API configuration. Please update your Stripe Secret Key in the Admin Panel.';
    }

    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
