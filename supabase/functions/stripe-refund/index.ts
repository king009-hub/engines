// supabase/functions/stripe-refund/index.ts
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

    // 1. Load Stripe settings
    const { data: settings, error: settingsError } = await supabaseClient.from('app_settings').select('*').maybeSingle()
    if (settingsError || !settings?.stripe_secret_key) throw new Error('Stripe is not configured')

    const stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 2. Validate admin auth
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    const { data: roleData } = await supabaseClient.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    if (!roleData) throw new Error('Only admins can process refunds')

    const { paymentId, paymentIntentId, reason } = await req.json()

    // 3. Trigger Stripe Refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    })

    // 4. Update Database
    await supabaseClient.from('payments').update({
      status: 'refunded',
      refund_reason: reason,
      updated_at: new Date().toISOString()
    }).eq('id', paymentId)

    return new Response(JSON.stringify({ success: true, refundId: refund.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
