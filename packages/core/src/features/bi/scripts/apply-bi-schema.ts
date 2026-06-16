/* eslint-disable no-console */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
    console.log('Reading bi_schema.sql...');
    const sqlPath = path.join(process.cwd(), 'bi_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL...');
    // Split by semicolon to execute statements individually if needed, 
    // but supabase-js rpc/sql usually takes one block. 
    // However, supabase-js doesn't have a direct 'query' method for raw SQL unless enabled via RPC or using pg driver.
    // Since we don't have a direct SQL execution method exposed via standard supabase-js client without a specific RPC,
    // we will try to use a workaround or assume the user has an RPC function `exec_sql`.
    // If not, we might fail.

    // BUT, I can use the `pg` library if installed? No, I only see `supabase-js` in package.json.
    // Wait, I can try to use the `postgres` library if available, but it's not in package.json.

    // Let's check if there is an `exec_sql` function or similar in the database.
    // If not, I will have to ask the user to run it, OR I can try to define an RPC via the SQL editor... which I can't access.

    // Wait, I can use the `run_command` to use `psql` if installed? The user is on Windows.
    // Maybe `npx supabase db push`? No, that requires CLI setup.

    // Let's try to assume there is no direct way to run raw SQL via supabase-js client unless an RPC exists.
    // I will try to call an RPC named `exec_sql` just in case.

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error executing SQL via RPC:', error);
        console.log('Attempting to use direct connection string if available? No.');
        console.log('PLEASE RUN THE CONTENT OF bi_schema.sql IN YOUR SUPABASE SQL EDITOR.');
    } else {
        console.log('SQL executed successfully via exec_sql RPC.');
    }
}

applySchema();
