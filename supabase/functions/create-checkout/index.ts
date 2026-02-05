import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { cart } = await req.json()

        // Validate cart
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            throw new Error('Cart is empty or invalid')
        }

        // Prepare items for Mercado Pago
        // In production, you would fetch prices from your DB here to prevent tampering.
        const items = cart.map((item: any) => ({
            title: item.name,
            quantity: item.quantity,
            unit_price: Number(item.price),
            currency_id: 'ARS',
            picture_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // Placeholder or real image
            description: `${item.name} - Color: ${item.selectedColor || 'N/A'}`,
        }))

        // Access Token from env
        const accessToken = Deno.env.get('MP_ACCESS_TOKEN')
        if (!accessToken) {
            throw new Error('MP_ACCESS_TOKEN is not set')
        }

        // Create Preference
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                items,
                back_urls: {
                    success: 'http://localhost:5173/compra-exitosa', // TODO: Change to production URL
                    failure: 'http://localhost:5173/catalog',
                    pending: 'http://localhost:5173/catalog'
                },
                auto_return: 'approved',
            })
        })

        const data = await response.json()

        if (data.error) {
            throw new Error(data.message || 'Error creating preference')
        }

        return new Response(
            JSON.stringify({ init_point: data.init_point, preference_id: data.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
