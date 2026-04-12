// supabase/functions/strict-stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get secrets from admin configuration
    const { data: settings, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('stripe_secret_key, stripe_webhook_secret')
      .maybeSingle()

    if (settingsError) throw new Error(`Database error: ${settingsError.message}`)
    if (!settings?.stripe_webhook_secret) throw new Error('Stripe Webhook Secret is not configured. Webhook cannot be verified.')

    const stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const signature = req.headers.get('Stripe-Signature')!
    const body = await req.text()
    
    // 2. Strict Signature Verification
    const event = stripe.webhooks.constructEvent(body, signature, settings.stripe_webhook_secret)
    console.log(`Verified Stripe event: ${event.type}`)

    // 3. Robust Event Handling
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const updateData: any = {
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent,
          transaction_id: session.id,
          updated_at: new Date().toISOString()
        }
        
        // Final fraud check before marking as paid
        if (session.metadata?.fraud_score === 'suspicious') {
          updateData.fraud_flag = 'suspicious'
        }

        await supabaseClient.from('payments').update(updateData).eq('stripe_session_id', session.id)
        
        // Handle subscription specifically
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription)
          await supabaseClient.from('subscriptions').insert({
            user_id: session.metadata?.user_id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            plan_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any
        await supabaseClient.from('payments').update({ status: 'failed' }).eq('stripe_payment_intent_id', pi.id)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as any
        await supabaseClient.from('payments').update({ status: 'refunded' }).eq('stripe_payment_intent_id', charge.payment_intent)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        await supabaseClient.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id)
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error(`Webhook error: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
