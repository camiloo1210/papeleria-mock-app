import { SupabaseMarketplaceRepository } from "@/features/marketplace/infrastructure/supabase-marketplace.repository";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, Star, Store } from "lucide-react";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MarketplacePage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const categorySlug = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
    const searchQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;

    const repo = new SupabaseMarketplaceRepository();
    const [businesses, categories] = await Promise.all([
        repo.findAllBusinesses(categorySlug, searchQuery),
        repo.findAllCategories()
    ]);

    // Prepare categories for UI (Add "Todas")
    const uiCategories = [
        { id: 0, name: "Todas", slug: "" },
        ...categories
    ];

    return (
        <div className="px-4 pb-20">

            {/* 1. Hero / Promo Banner Slider */}
            <div className="relative mb-8 rounded-3xl overflow-hidden shadow-lg h-48 sm:h-64 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Tus Tiendas Favoritas</h2>
                        <p className="text-lg md:text-xl font-medium opacity-90">Explora cientos de negocios locales</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full bg-white opacity-10 blur-xl"></div>
            </div>

            {/* 2. Category Filter Rail (Scrollable) */}
            <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-4">
                {uiCategories.map((cat) => {
                    const isActive = categorySlug === cat.slug || (!categorySlug && cat.slug === "");
                    return (
                        <Link
                            key={cat.id}
                            href={cat.slug ? `/marketplace?category=${cat.slug}` : '/marketplace'}
                        >
                            <Button
                                variant={isActive ? "default" : "secondary"}
                                className={`rounded-full px-6 h-10 font-medium whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white shadow-sm hover:bg-gray-100 text-gray-700'}`}
                            >
                                {cat.name}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* 3. Main Business Grid */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5 text-indigo-500" />
                    Tiendas Disponibles
                </h3>

                {businesses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                        <p className="text-gray-400 text-lg">No hay tiendas disponibles por el momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {businesses.map((business) => (
                            <Link href={`/marketplace/${business.uuid}`} key={business.uuid} className="group block h-full">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer transform hover:-translate-y-1">

                                    {/* Banner/Cover Area */}
                                    <div
                                        className="h-32 w-full bg-gray-100 relative"
                                        style={{ backgroundColor: business.brandColor || '#e0e7ff' }}
                                    >
                                        {/* Logo Overlay */}
                                        <div className="absolute -bottom-6 left-4 border-4 border-white rounded-full bg-white shadow-md overflow-hidden h-16 w-16 flex items-center justify-center">
                                            {business.logoUrl ? (
                                                <Image src={business.logoUrl} alt={business.tradeName} width={64} height={64} className="object-cover h-full w-full" />
                                            ) : (
                                                <Store className="h-8 w-8 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="pt-8 p-4 flex flex-col flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1 text-xs font-semibold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-md">
                                                <Star className="h-3 w-3 fill-yellow-500" />
                                                <span>{business.ratingAverage > 0 ? business.ratingAverage.toFixed(1) : 'Nuevo'}{business.ratingCount > 0 && ` (${business.ratingCount})`}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-400 gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>20-30 min</span>
                                            </div>
                                        </div>

                                        <h3 className="text-gray-900 font-bold text-lg leading-tight mb-1">{business.tradeName}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{business.legalName}</p>

                                        <div className="mt-auto pt-3 border-t border-gray-50 text-xs text-indigo-600 font-medium group-hover:underline">
                                            Ver productos &rarr;
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
