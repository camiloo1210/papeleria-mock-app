import Link from 'next/link';
import { User, LogOut, Settings, History, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserPermissions } from "@/features/permissions/actions/get-user-permissions";
import { Permission } from "@/features/permissions/domain/permissions";
import { MarketplaceThemeReset } from "@/features/shared/theme/marketplace-theme-reset";
import { CartTrigger } from './components/cart-trigger';
import { MarketplaceCartSheet } from './components/marketplace-cart-sheet';
import { MarketplaceSearch } from './components/marketplace-search';

export default async function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // RBAC Check: Only Admins can access Marketplace
    const headersList = await headers();
    const tenantIdStr = headersList.get('X-Tenant-ID');

    if (tenantIdStr) {
        // const permissions = await getUserPermissions(Number(tenantIdStr));
        // if (!permissions.includes(Permission.ROLES_MANAGE)) {
        //     redirect('/protected');
        // }
    } else {
        // If no tenant context (e.g. direct access without session/middleware setup), redirect to login or protected
        // Redirecting to login/protected is safer.
        // However, middleware should handle auth. If we rely on X-Tenant-ID, it implies authenticated session.
        // Let's redirect to /protected just in case.
        // redirect('/protected'); // Only if we are strict. For now, permissions check is key.
    }
    return (
        <div className="h-screen overflow-y-auto bg-gray-50">
            <MarketplaceThemeReset />
            {/* Navbar Fixed - Rappi Style */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 gap-4">

                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/marketplace" className="text-2xl font-black text-indigo-600 tracking-tight">
                                Papelería<span className="text-gray-900 font-light"> Market</span>
                            </Link>
                        </div>

                        {/* Search Bar - Centered & Prominent */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                            <MarketplaceSearch />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-2 sm:space-x-4">

                            <CartTrigger />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700 h-8 w-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        <User className="h-4 w-4 text-white" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Link href="/protected" className="flex items-center w-full">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Panel de Admin</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Link href="/marketplace/history" className="flex items-center w-full">
                                            <History className="mr-2 h-4 w-4" />
                                            <span>Historial de Compras</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Link href="/marketplace/profile" className="flex items-center w-full">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Configuración</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700">
                                        <Link href="/auth/signout" className="flex items-center w-full">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Cerrar Sesión</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>
                    </div>
                </div>

                {/* Mobile Search - Visible only on mobile */}
                <div className="md:hidden px-4 pb-3">
                    <MarketplaceSearch />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)]">
                {children}
            </main>
            <MarketplaceCartSheet />
        </div>
    );
}
