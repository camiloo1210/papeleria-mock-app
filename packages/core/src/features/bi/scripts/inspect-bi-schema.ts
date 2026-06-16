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

async function inspectSchema() {
    console.log('Checking for core.inventory_logs...');
    const { data, error } = await supabase
        .schema('core')
        .from('inventory_logs')
        .select('*')
        .limit(1);

    if (error) {
        console.log('core.inventory_logs error:', error.message);
    } else {
        console.log('core.inventory_logs exists. Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'Empty table (or columns found)');
    }

    console.log('Checking triggers (via information_schema)...');
    const { data: triggers, error: trigError } = await supabase
        .from('information_schema.triggers')
        .select('*')
        .in('event_object_table', ['products', 'order_items'])
        .eq('event_object_schema', 'core');

    if (trigError) {
        console.log('Error checking triggers:', trigError.message);
    } else if (triggers && triggers.length > 0) {
        console.log('Found triggers:');
        triggers.forEach(t => console.log(`- ${t.trigger_name} on ${t.event_object_table}`));
    } else {
        console.log('No triggers found via information_schema (RLS might hide them).');
    }
}

inspectSchema();
