import { SupabaseMarketplaceRepository } from "@/features/marketplace/infrastructure/supabase-marketplace.repository";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { resolveTenantId } from "@/shared/utils/auth.utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessInfoSheet } from "./business-info-sheet";
import { ConnectSupplierButton } from "./connect-supplier-button";
import { RatingsList } from "@/features/business/ui/components/ratings-list";
import { ReviewForm } from "@/features/business/ui/components/review-form";
import { CatalogView } from "./catalog-view";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        businessId: string;
    }>;
}

export default async function BusinessShopPage({ params }: PageProps) {
    // Await params as required in Next.js 15+
    const resolvedParams = await params;
    const businessUuid = resolvedParams.businessId; // The param name is still businessId from the folder [businessId], but value is UUID

    const repo = new SupabaseMarketplaceRepository();

    // 1. Resolve Business by UUID to get the integer ID needed for products
    const business = await repo.findBusinessByUuid(businessUuid);

    if (!business) {
        return notFound();
    }

    // 2. Fetch products using the resolved Integer ID
    const products = await repo.findProductsByBusiness(business.id);

    // 3. Check for specific Role Access (ADMIN only)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let showConnectButton = false;

    if (user) {
        const tenantId = await resolveTenantId(user);
        if (tenantId && tenantId !== business.id) { // Cannot connect to self
            // Verify if user is ADMIN of their tenant using Service Role for safety
            const adminSupabase = createServiceRoleClient();

            // First get core user id
            const { data: coreUser } = await adminSupabase
                .schema('core')
                .from('users')
                .select('id')
                .eq('uuid', user.id)
                .single();

            if (coreUser) {
                const { data: employee } = await adminSupabase
                    .schema('core')
                    .from('employees')
                    .select('id, role_id')
                    .eq('tenant_id', tenantId)
                    .eq('user_id', coreUser.id)
                    .single();

                if (employee && employee.role_id === 1 && business.acceptsSuppliers) {
                    showConnectButton = true;
                }
            }
        }
    }

    // Default values
    const tradeName = business.tradeName;
    const brandColor = business.brandColor || '#4f46e5';
    const logoUrl = business.logoUrl;

    return (
        <div className="pb-20">
            {/* Header / Cover */}
            <div className="relative h-48 md:h-64 bg-gray-900 text-white overflow-hidden -mt-6">
                <div className="absolute inset-0 bg-opacity-50 bg-black z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 blur-sm"
                    style={{ backgroundColor: brandColor }}
                />

                <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-end pb-6">
                    <div className="flex justify-between items-end mb-4">
                        <Link href="/marketplace" className="text-white/80 hover:text-white flex items-center gap-2 w-fit">
                            <ArrowLeft className="h-5 w-5" />
                            Volver al Marketplace
                        </Link>

                        <div className="flex items-center gap-2">
                            {showConnectButton && (
                                <ConnectSupplierButton targetBusinessId={business.id} />
                            )}
                            <BusinessInfoSheet
                                businessId={business.id}
                                tradeName={tradeName}
                                ratingAverage={business.ratingAverage}
                                ratingCount={business.ratingCount}
                            >
                                <div className="mb-8">
                                    <ReviewForm targetBusinessId={business.id} />
                                </div>
                                <RatingsList targetBusinessId={business.id} />
                            </BusinessInfoSheet>
                        </div>
                    </div>

                    <div className="flex items-end gap-4">
                        <div className="h-20 w-20 md:h-24 md:w-24 bg-white rounded-full border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
                            {logoUrl ? (
                                <Image src={logoUrl} alt={tradeName} width={96} height={96} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Star className="h-10 w-10" />
                                </div>
                            )}
                        </div>
                        <div className="mb-1">
                            <h1 className="text-3xl md:text-4xl font-bold">{tradeName}</h1>
                            <div className="flex items-center gap-4 text-sm md:text-base text-white/90 mt-1">
                                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {business.ratingAverage > 0 ? business.ratingAverage.toFixed(1) : 'Nuevo'}</span>
                                <span>•</span>
                                <span>$$$</span>
                                <span>•</span>
                                <span>20-30 min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Catálogo de Productos</h2>

                        {products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500">Este negocio aún no tiene productos publicados.</p>
                                <Link href="/marketplace">
                                    <Button variant="link" className="mt-2 text-indigo-600">Explorar otras tiendas</Button>
                                </Link>
                            </div>
                        ) : (
                            <CatalogView products={products} businessUuid={businessUuid} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
