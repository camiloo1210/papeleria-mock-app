"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";
import { useAccessControl } from "@/features/permissions/ui/context/AccessControlContext";
import { Permission } from "@/features/permissions/domain/permissions";

import { Store, ShoppingBag } from "lucide-react";

interface UserNavProps {
    email?: string | null;
    tenantId?: number | null;
}

export function UserNav({ email, tenantId }: UserNavProps) {
    const { permissions } = useAccessControl();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" suppressHydrationWarning>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Usuario</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {permissions.includes(Permission.ROLES_MANAGE) && (
                    <>
                        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground uppercase tracking-wider py-1">
                            Marketplace
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href="/marketplace" className="cursor-pointer">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                <span>Ir al Marketplace</span>
                            </Link>
                        </DropdownMenuItem>
                        {tenantId && (
                            <DropdownMenuItem asChild>
                                {/* Determine if we link to profile directly or settings */}
                                {/* User asked for "configure page". Let's link to the Business Profile which we are building out, and assume we'll add edit controls there. */}
                                {/* We use the UUID if possible, but we only have tenantId (int). Marketplace uses UUID in URL but repository resolves both. */}
                                {/* We need the UUID for the URL [businessId]. */}
                                {/* Since we only have integer ID here, we might need to fetch UUID or use integer in URL if supported. */}
                                {/* Or simply link to /protected/settings/marketplace if we create it. */}
                                {/* For now, let's link to a new settings page we will create: /protected/settings/marketplace */}
                                <Link href="/protected/settings/marketplace" className="cursor-pointer">
                                    <Store className="mr-2 h-4 w-4" />
                                    <span>Mi Página / Perfil</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground uppercase tracking-wider py-1">
                    Cuenta
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href="/account">Configuración</Link>
                </DropdownMenuItem>
                {permissions.includes(Permission.ROLES_MANAGE) && (
                    <DropdownMenuItem asChild>
                        <Link href="/protected/settings/billing">Gestión Tributaria</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer">
                    <form action="/auth/signout" method="POST" className="w-full">
                        <button type="submit" className="w-full text-left">
                            Cerrar Sesión
                        </button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
