// supabase/functions/secure-stripe-checkout/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Load Advanced Settings with robust fallback
    const { data: settings, error: settingsError } = await supabaseClient.from('app_settings').select('*').maybeSingle()
    
    if (settingsError) throw new Error(`Database error: ${settingsError.message}`)
    if (!settings?.stripe_secret_key) throw new Error('Stripe is not configured. Please set your Secret Key in the Admin Panel.')

    const stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 2. Identify User & Fraud Metadata
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    
    const { items, type, plan_id, success_url, cancel_url } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || '0.0.0.0'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // 3. Basic Fraud Detection Logic
    // Example: Check for multiple pending/failed attempts from same IP in last hour
    const { data: recentAttempts } = await supabaseClient
      .from('payments')
      .select('id')
      .eq('ip_address', ip)
      .gt('created_at', new Date(Date.now() - 3600000).toISOString())
    
    let fraudFlag = 'safe'
    if (recentAttempts && recentAttempts.length > 5) fraudFlag = 'suspicious'

    // 4. Create Session (One-time or Subscription)
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [],
      mode: type === 'subscription' ? 'subscription' : 'payment',
      customer_email: user?.email,
      success_url: success_url || `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/checkout/cancel`,
      metadata: {
        user_id: user?.id || 'anonymous',
        ip_address: ip,
        fraud_score: fraudFlag
      }
    }

    if (type === 'subscription') {
      sessionConfig.line_items = [{ price: plan_id, quantity: 1 }]
    } else {
      sessionConfig.line_items = items.map((i: any) => ({
        price_data: {
          currency: settings.currency.toLowerCase(),
          product_data: { name: i.name, images: i.image ? [i.image] : [] },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
      }))
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    // 5. Log Initial Payment Record
    const totalAmount = type === 'subscription' ? 0 : items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)
    await supabaseClient.from('payments').insert({
      user_id: user?.id,
      email: user?.email || 'anonymous',
      amount: totalAmount,
      currency: settings.currency,
      status: 'pending',
      fraud_flag: fraudFlag,
      stripe_session_id: session.id,
      ip_address: ip,
      device_info: { user_agent: userAgent },
      metadata: sessionConfig.metadata
    })

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
