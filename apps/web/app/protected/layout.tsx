import { SidebarContainer } from "@/features/dashboard/components/sidebar-container";
import { Header } from "@/features/dashboard/components/header";
import { BusinessThemeEnforcer } from "@/features/shared/theme/business-theme-enforcer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Auth Check (Standard Client) - Must remain standard to verify session validity
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user theme settings
    let userThemeSettings = {};
    if (user) {
        const { data: userData } = await supabase
            .schema('core')
            .from('users')
            .select('theme_settings')
            .eq('uuid', user.id)
            .single();
        userThemeSettings = userData?.theme_settings || {};
    }

    if (!user && process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
        redirect("/auth/login");
    }

    // 2. Fetch Tenant ID (Service Role or Client if User is logged in)
    const { data: employee } = await supabase
        .schema('core')
        .from('employees')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

    const tenantId = employee?.tenant_id;

    // 3. Fetch Brand Color (if tenant exists)
    let brandColor: string | undefined;
    if (tenantId) {
        const { data: business } = await supabase
            .schema('core')
            .from('business')
            .select('brand_color')
            .eq('id', tenantId)
            .single();
        brandColor = business?.brand_color || undefined;
    }

    return (
        <div className="flex h-screen max-h-screen w-full overflow-hidden">
            <BusinessThemeEnforcer brandColor={brandColor} themeSettings={userThemeSettings} />
            <SidebarContainer />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header email={user.email} tenantId={tenantId} />
                <main className="flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
