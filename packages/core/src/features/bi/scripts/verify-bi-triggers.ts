/* eslint-disable no-console */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTriggers() {
    console.log('Starting BI Trigger Verification...');

    // 1. Get a product
    const { data: products, error: prodError } = await supabase
        .schema('core')
        .from('products')
        .select('*')
        .limit(1);

    if (prodError || !products || products.length === 0) {
        console.error('No products found to test. Please seed data first.');
        return;
    }

    const product = products[0];
    const initialStock = product.stock;
    console.log(`Testing with Product: ${product.name} (ID: ${product.id}), Stock: ${initialStock}`);

    // 2. Test Manual Adjustment Trigger
    console.log('\n--- Testing Manual Adjustment Trigger ---');
    const newStock = initialStock + 10;
    const { error: updateError } = await supabase
        .schema('core')
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id);

    if (updateError) {
        console.error('Error updating product stock:', updateError);
        return;
    }
    console.log(`Updated stock to ${newStock}. Checking logs...`);

    // Wait a bit for trigger? usually immediate.
    const { data: adjLogs, error: adjLogError } = await supabase
        .schema('core')
        .from('inventory_logs')
        .select('*')
        .eq('product_id', product.id)
        .eq('reason', 'ADJUSTMENT')
        .order('created_at', { ascending: false })
        .limit(1);

    if (adjLogError) {
        console.error('Error fetching logs:', adjLogError);
    } else if (adjLogs && adjLogs.length > 0) {
        const log = adjLogs[0];
        console.log('✅ Adjustment Log Found:', log);
        if (log.change_amount === 10 && log.new_stock === newStock) {
            console.log('✅ Log values are correct.');
        } else {
            console.error('❌ Log values incorrect:', log);
        }
    } else {
        console.error('❌ No Adjustment Log found!');
    }

    // 3. Test Sale Trigger (Order Item)
    console.log('\n--- Testing Sale Trigger ---');
    // Need a valid order ID. Let's create a dummy order first? 
    // Or just insert into order_items if constraints allow (need valid order_id).
    // Let's fetch an existing order or create a minimal one.

    // Fetch an order
    const { data: orders } = await supabase.schema('core').from('orders').select('id').limit(1);
    let orderId;

    if (!orders || orders.length === 0) {
        console.log('Creating a dummy order for testing...');
        const { data: newOrder, error: orderError } = await supabase
            .schema('core')
            .from('orders')
            .insert({
                tenant_id: product.tenant_id,
                subtotal: 10,
                taxes: 0,
                discounts: 0,
                total: 10,
                status: 'pending'
            })
            .select()
            .single();

        if (orderError) {
            console.error('Error creating dummy order:', orderError);
            return;
        }
        orderId = newOrder.id;
    } else {
        orderId = orders[0].id;
    }

    console.log(`Using Order ID: ${orderId}. Inserting Order Item...`);
    const quantitySold = 2;
    const { error: itemError } = await supabase
        .schema('core')
        .from('order_items')
        .insert({
            order_id: orderId,
            product_id: product.id,
            quantity: quantitySold,
            unit_price: 10,
            line_total: 20
        });

    if (itemError) {
        console.error('Error inserting order item:', itemError);
        return;
    }
    console.log(`Inserted order item (Qty: ${quantitySold}). Checking logs...`);

    const { data: saleLogs, error: saleLogError } = await supabase
        .schema('core')
        .from('inventory_logs')
        .select('*')
        .eq('product_id', product.id)
        .eq('reason', 'SALE')
        .order('created_at', { ascending: false })
        .limit(1);

    if (saleLogError) {
        console.error('Error fetching logs:', saleLogError);
    } else if (saleLogs && saleLogs.length > 0) {
        const log = saleLogs[0];
        console.log('✅ Sale Log Found:', log);
        if (log.change_amount === -quantitySold) {
            console.log('✅ Log values are correct.');
        } else {
            console.error('❌ Log values incorrect:', log);
        }
    } else {
        console.error('❌ No Sale Log found!');
    }

    // Verify stock update from sale trigger
    const { data: finalProduct } = await supabase
        .schema('core')
        .from('products')
        .select('stock')
        .eq('id', product.id)
        .single();

    if (finalProduct) {
        console.log(`Final Product Stock: ${finalProduct.stock} (Expected: ${newStock - quantitySold})`);
        if (finalProduct.stock === newStock - quantitySold) {
            console.log('✅ Product stock updated correctly by trigger.');
        } else {
            console.error('❌ Product stock update incorrect.');
        }
    }
}

verifyTriggers();
