import { WhatsAppConfigForm } from '@/features/marketplace/whatsapp/ui/config-form';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { WhatsAppRepository } from '@/features/marketplace/whatsapp/infrastructure/whatsapp.repository';
import { createClient } from '@/lib/supabase/server'; // Use server client for Auth context

export default async function WhatsappConfigPage() {
    const supabase = await createClient(); // Use standard server client to get auth session
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Debes iniciar sesión.</div>;
    }

    // Resolve Tenant ID from Employee table using Service Role (to avoid RLS issues if any, or strictly follow RLS)
    // Actually better to use RLS-safe query.
    // But repository expects `SupabaseClient`.
    // Let's use service role to resolve tenant safely for the initial data fetch.
    const serviceClient = createServiceRoleClient();

    // 1. Get Employee Tenant and Role
    const { data: employee } = await serviceClient
        .schema('core')
        .from('employees')
        .select(`
            tenant_id,
            role_id,
            role:roles(name)
        `)
        .eq('user_id', user.id)
        .single();

    // Check Permissions (Simple Role Check)
    // @ts-expect-error - Supabase types join is tricky to type automatically without advanced generics
    const roleName = employee?.role?.name;
    const isAdmin = roleName === 'ADMIN';

    if (!employee || !isAdmin) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Acceso Denegado. </strong>
                    <span className="block sm:inline">Solo los administradores pueden configurar la integración de WhatsApp.</span>
                </div>
            </div>
        );
    }

    let initialData = null;

    if (employee?.tenant_id) {
        // 2. Get Config
        const repo = new WhatsAppRepository(serviceClient);
        // Note: Repository getByTenantId returns Promise<WhatsAppConfig | null>
        const config = await repo.getByTenantId(String(employee.tenant_id)); // Cast bigint to string if needed by TS types
        initialData = config;
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Integraciones</h1>
                <p className="text-gray-500">Gestiona tus conexiones con servicios externos.</p>
            </div>

            <WhatsAppConfigForm initialData={initialData} />
        </div>
    );
}
