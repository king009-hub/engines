import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Cache settings to avoid db hits on every call
let cachedSettings: any = null;
let settingsCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const now = Date.now();
    if (!cachedSettings || (now - settingsCacheTime > CACHE_TTL)) {
      const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('*')
        .single()
        
      if (settingsError || !settings?.stripe_secret_key) {
        throw new Error('Stripe is not configured')
      }
      cachedSettings = settings;
      settingsCacheTime = now;
    }

    const settings = cachedSettings;

    const stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { items, currency, email: providedEmail, phone, address } = await req.json()
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items provided' }), { headers: cors, status: 400 })
    }

    // Optimization: Fetch prices from the database directly for security and speed
    const productIds = items.map((i: any) => i.product_id || i.id).filter(Boolean)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds)

    if (productsError || !products) {
      throw new Error('Failed to fetch product information')
    }

    const amount = items.reduce((sum: number, i: any) => {
      const p = products.find(x => x.id === (i.product_id || i.id))
      if (!p) return sum
      const price = Number(p.price || 0)
      const qty = Number(i.quantity || 1)
      return sum + Math.max(0, Math.round(price * 100)) * qty
    }, 0)

    if (amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { headers: cors, status: 400 })
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: (currency || settings.currency || 'USD').toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        email: providedEmail || '',
        phone: phone || '',
        address: address || '',
        items: JSON.stringify(items.map(i => ({ id: i.product_id || i.id, qty: i.quantity || 1 })))
      }
    })

    // Create payment record in database for tracking
    try {
      // Get user from auth header if present
      const authHeader = req.headers.get('Authorization')
      let user_id = null
      let email = providedEmail || 'guest@enginemarkets.com'
      
      // Auto-Registration Logic for Guest users
      if (!authHeader && providedEmail) {
        console.log(`[Auto-Registration] Checking user for email: ${providedEmail}`)
        
        // Use service role key to manage users
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Check if user already exists
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find(u => u.email === providedEmail)

        if (!existingUser) {
          console.log(`[Auto-Registration] Creating new user for: ${providedEmail}`)
          // Create new user with a temporary password
          const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email: providedEmail,
            email_confirm: true, // Auto-confirm email
            user_metadata: { 
              full_name: providedEmail.split('@')[0], // Use email part as name initially
              phone: phone || '' 
            }
          })

          if (!signUpError && newUser?.user) {
            user_id = newUser.user.id
            email = providedEmail
            
            // Create profile entry manually (if trigger doesn't exist)
            await supabaseAdmin.from('profiles').upsert({
              id: user_id,
              email: providedEmail,
              phone: phone || '',
              address: address || '',
              full_name: providedEmail.split('@')[0]
            })
          }
        } else {
          user_id = existingUser.id
          email = providedEmail
          
          // Update profile with latest phone/address
          await supabaseAdmin.from('profiles').update({
            phone: phone || '',
            address: address || ''
          }).eq('id', user_id)
        }
      } else if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) {
          user_id = user.id
          email = providedEmail || user.email || email
        }
      }

      await supabase.from('payments').insert({
        user_id,
        email,
        phone,
        amount: amount / 100,
        currency: (currency || settings.currency || 'USD').toUpperCase(),
        status: 'pending',
        stripe_payment_intent_id: intent.id,
        metadata: { 
          address,
          phone,
          items: items.map(i => {
            const p = products.find(x => x.id === (i.product_id || i.id));
            return { 
              name: p?.name || 'Unknown', 
              qty: i.quantity 
            };
          }) 
        }
      })
    } catch (dbErr) {
      console.error('Failed to log payment to DB:', dbErr.message)
    }

    return new Response(JSON.stringify({ clientSecret: intent.client_secret }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 200
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      headers: { ...cors, 'Content-Type': 'application/json' }, status: 400
    })
  }
})
