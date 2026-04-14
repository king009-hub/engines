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

      // Create actual order record
      try {
        const pi = event.type === 'payment_intent.succeeded' 
          ? sessionOrPi 
          : await stripe.paymentIntents.retrieve(piId)
        
        const { email, phone, address, items: itemsStr } = pi.metadata || {}
        const items = itemsStr ? JSON.parse(itemsStr) : []

        // Create the order
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .insert({
            user_id: sessionOrPi.customer || null,
            email: email || sessionOrPi.customer_details?.email,
            phone: phone || sessionOrPi.customer_details?.phone,
            shipping_address: address || sessionOrPi.customer_details?.address?.line1,
            total: (pi.amount / 100),
            status: 'paid',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (!orderError && order) {
          // Create order items
          if (items.length > 0) {
            const orderItems = items.map((item: any) => ({
              order_id: order.id,
              product_id: item.id,
              quantity: item.qty,
              price: 0 // In a real app, you'd fetch the current price
            }))
            await supabaseClient.from('order_items').insert(orderItems)
          }
        } else if (orderError) {
          console.error('Order creation error:', orderError.message)
        }
      } catch (err) {
        console.error('Failed to process order record:', err.message)
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
