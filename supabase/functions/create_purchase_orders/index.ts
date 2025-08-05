import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('--- New Request ---');
  console.log('Method:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('CORS check passed. Attempting to create Supabase client.');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        console.error('Error: Authorization header is missing.');
        return new Response(JSON.stringify({ error: 'Missing Authorization Header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseClient = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('PROJECT_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    console.log('Supabase client created. Getting user.');
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      console.error('Error: Supabase user not found from JWT.');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    console.log('User found:', user.id);

    console.log('Getting user profile to check role.');
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error getting user profile:', profileError);
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    console.log('User role is:', profile.role);

    if (profile.role !== 'owner') {
      console.error('Authorization failed. User role is not owner.');
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log('Authorization successful. Parsing request body.');
    const { items, supplier_id } = await req.json()

    // Проверяем наличие ID поставщика
    if (!supplier_id) {
      return new Response(JSON.stringify({ error: 'Supplier ID is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    };
    console.log('Request body parsed. Items:', items);
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const serviceClient = createClient(
      Deno.env.get('PROJECT_URL')!,
      Deno.env.get('PROJECT_SERVICE_ROLE')!
    )

    // 1. Создаем один заказ в таблице purchase_orders
    console.log('Step 1: Creating a single purchase order.')
    const { data: newPurchaseOrder, error: poError } = await serviceClient
      .from('purchase_orders')
      .insert({
        status: 'ordered',
        supplier_id: supplier_id, // Используем ID поставщика
        created_by: user.id,      // Добавляем ID создателя заказа
      })
      .select()
      .single()

    if (poError) {
      console.error('Supabase PO Insert Error:', poError)
      return new Response(JSON.stringify({ error: `Failed to create purchase order: ${poError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // КРИТИЧЕСКАЯ ПРОВЕРКА: Убедимся, что заказ действительно создан
    if (!newPurchaseOrder) {
        const errorMsg = 'Failed to create purchase order: database returned null.'
        console.error(errorMsg)
        return new Response(JSON.stringify({ error: errorMsg }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    console.log(`Step 2: Purchase order created with ID: ${newPurchaseOrder.id}. Now adding items.`)

    // 2. Готовим данные для вставки в purchase_order_items
    const purchaseOrderItemsData = items.map((item) => ({
      purchase_order_id: newPurchaseOrder.id, // Используем ID только что созданного заказа
      product_id: item.product_id,
      quantity_ordered: item.qty,
    }))

    // 3. Вставляем все товары в связующую таблицу
    const { data, error: itemsError } = await serviceClient
      .from('purchase_order_items')
      .insert(purchaseOrderItemsData)
      .select()

    if (itemsError) {
      console.error('Supabase PO Items Insert Error:', itemsError)
      // Здесь можно добавить логику отката/удаления созданного purchase_order, если вставка товаров не удалась
      return new Response(JSON.stringify({ error: `Failed to add items to purchase order: ${itemsError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Successfully inserted purchase order.');
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    // Этот блок отловит любые непредвиденные ошибки (например, newPurchaseOrder.id)
    console.error('Root catch block error:', error)
    return new Response(JSON.stringify({ error: 'An unexpected error occurred in the function.', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
