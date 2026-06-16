import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BusinessProfileForm } from "./business-profile-form";
import { Separator } from "@/components/ui/separator";

export default async function MarketplaceSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch Business Data
    const { data: employee } = await supabase
        .schema('core')
        .from('employees')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

    if (!employee?.tenant_id) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">No tienes un negocio asignado.</h2>
            </div>
        );
    }

    const { data: business } = await supabase
        .schema('core')
        .from('business')
        .select('id, trade_name, brand_color, logo_url, categories:business_category_links(category_id)')
        .eq('id', employee.tenant_id)
        .single();

    if (!business) {
        return <div>Error al cargar datos del negocio.</div>;
    }

    // Map to camelCase for component
    const businessData = {
        id: business.id,
        tradeName: business.trade_name,
        brandColor: business.brand_color,
        logoUrl: business.logo_url,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categoryIds: (business as any).categories?.map((c: any) => c.category_id) || []
    };

    // Fetch All Categories
    const { data: categories } = await supabase
        .schema('core')
        .from('business_categories')
        .select('id, name')
        .order('name');

    return (
        <div className="space-y-6 p-10 pb-16 block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Perfil de Marketplace</h2>
                <p className="text-muted-foreground">
                    Personaliza cómo ven tu negocio otros usuarios en el Marketplace.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    {/* Sidebar nav references could go here if we had more sections */}
                </aside>
                <div className="flex-1 lg:max-w-2xl">
                    <BusinessProfileForm
                        business={businessData}
                        availableCategories={categories || []}
                    />
                </div>
            </div>
        </div>
    );
}
