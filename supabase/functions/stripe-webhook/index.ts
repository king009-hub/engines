// stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get webhook secret from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('stripe_secret_key, stripe_webhook_secret')
      .single()

    if (settingsError || !settings?.stripe_webhook_secret) {
      throw new Error('Webhook secret is not configured in admin panel')
    }

    const stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const signature = req.headers.get('Stripe-Signature')!
    const body = await req.text()
    
    // 2. Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      settings.stripe_webhook_secret
    )

    console.log(`Processing event: ${event.type}`)

    // 3. Handle events
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const sessionOrPi = event.data.object as any
      const piId = sessionOrPi.payment_intent || sessionOrPi.id
      const sessionId = sessionOrPi.id.startsWith('cs_') ? sessionOrPi.id : null
      
      // Update payment record to PAID
      const query = supabaseClient.from('payments').update({
        status: 'paid',
        stripe_payment_intent_id: piId,
        updated_at: new Date().toISOString()
      })

      if (sessionId) {
        await query.eq('stripe_session_id', sessionId)
      } else {
        await query.eq('stripe_payment_intent_id', piId)
      }

      console.log(`Payment confirmed for ${piId}`)
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as any
      await supabaseClient
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', pi.id)
      
      console.log(`Payment failed for intent ${pi.id}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error(`Webhook error: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
