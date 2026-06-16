import { createClient, createServiceRoleClient } from "./src/lib/supabase/server";

process.env.NEXT_PUBLIC_USE_MOCK = 'true';

async function test() {
    console.log("Simulating protected/page.tsx loading sequence...");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Auth user:", user);

    if (!user) {
        console.log("No user found!");
        return;
    }

    const rawServiceRoleClient = createServiceRoleClient();
    const { data: userData, error: userError } = await rawServiceRoleClient
        .schema('core')
        .from('users')
        .select('id, tenant_id, person_id')
        .eq('uuid', user.id)
        .single();

    console.log("User data:", userData);
    console.log("User error:", userError);
}

test().catch(console.error);
