"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    LayoutDashboard,
    Store,
    Package,
    ShoppingCart,
    CreditCard,
    Users,
    BarChart3,
    Settings,
    UserCircle,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Plus,
    Shield,
    Banknote,
} from "lucide-react";

import { useAccessControl } from "@/features/permissions/ui/context/AccessControlContext";
import { Permission } from "@/features/permissions/domain/permissions";
import { useBusiness } from "@/features/business/ui/context/BusinessContext";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/protected",
        icon: LayoutDashboard,
    },
    {
        title: "WhatsApp Admin",
        href: "/protected/settings/whatsapp",
        icon: MessageCircle,
    },
    {
        title: "WhatsApp Chat",
        href: "/whatsapp-simulator",
        icon: MessageCircle,
    },
    {
        title: "Catálogo Admin",
        href: "/protected/products",
        icon: Package,
    },
    {
        title: "Crear Producto",
        href: "/protected/products/create",
        icon: Plus,
    },
    {
        title: "Órdenes",
        href: "/protected/sales/orders",
        icon: ShoppingCart,
    },
    {
        title: "BI Dashboard",
        href: "/protected/bi",
        icon: BarChart3,
    },
    {
        title: "Empleados",
        href: "/protected/settings/employees",
        icon: Users,
    },
    {
        title: "Roles",
        href: "/protected/settings/roles",
        icon: Shield,
    },
    {
        title: "Mi Perfil",
        href: "/marketplace/profile",
        icon: UserCircle,
    },
    {
        title: "Ver Catálogo",
        href: "/marketplace/mock-biz-00000000-0000-0000-0000-000000000001",
        icon: Store,
    },
    {
        title: "Checkout",
        href: "/marketplace/checkout",
        icon: CreditCard,
    },
    {
        title: "Cuenta",
        href: "/account",
        icon: Settings,
    },
];

interface SidebarProps {
    roleId?: number;
    position?: string;
    roleName?: string;
}

export function Sidebar({ roleId, roleName }: SidebarProps) {
    const { businessName, logoUrl } = useBusiness();
    const { permissions } = useAccessControl();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isEmployee = roleId === 2 || roleName === 'EMPLOYEE';

    const filteredItems = sidebarItems.filter(item => {
        if (isEmployee) {
            // Strict filter for Employees: Dashboard, Create Sale, and Account
            if (item.href === '/protected') return true;
            if (item.href === '/account') return true;

            // Special case: Replace generic Sales link with Create Sale link for Employees
            // We'll handle the link change in the map function or by adding a specific item for them
            // For now, let's allow the Sales item but we might need to override the href in the render
            // Actually, better to just check if it's the sales item and we are employee, we skip it here
            // and maybe add a custom item? 
            // Simpler approach: Just allow specific hrefs.

            return false;
        }
        // Default permission-based filter for everyone else
        return !item.requiredPermission || permissions.includes(item.requiredPermission);
    });

    // Custom items for Employees to override standard paths
    const employeeItems = [
        {
            title: "Dashboard",
            href: "/protected",
            icon: LayoutDashboard,
        },
        {
            title: "Nueva Venta",
            href: "/protected/sales/orders/create",
            icon: ShoppingCart,
        },
        {
            title: "Cuenta",
            href: "/account",
            icon: Settings,
        },
        {
            title: "Mis Nóminas",
            href: "/my-payroll",
            icon: Banknote,
        }
    ];

    const itemsToRender = isEmployee ? employeeItems : filteredItems;





    return (
        <TooltipProvider>
            <div
                className={cn(
                    "hidden border-r bg-muted/40 md:flex h-full flex-col transition-all duration-300 ease-in-out shrink-0",
                    isCollapsed ? "w-[60px]" : "w-64"
                )}
            >
                <div className={cn("flex h-14 items-center border-b px-4 shrink-0", isCollapsed ? "justify-center px-2" : "px-6")}>
                    <Link href="/" className="flex items-center gap-3 font-semibold overflow-hidden">
                        <div className="relative h-8 w-8 min-w-[2rem] flex-shrink-0 bg-white rounded-md overflow-hidden">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt={`${businessName} Logo`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {businessName.charAt(0)}
                                </div>
                            )}
                        </div>
                        {!isCollapsed && <span className="truncate">{businessName}</span>}
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-2 text-sm font-medium">
                        {itemsToRender.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            if (isCollapsed) {
                                return (
                                    <Tooltip key={item.href} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 mx-auto mb-1",
                                                    isActive
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-muted-foreground hover:bg-muted"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span className="sr-only">{item.title}</span>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {item.title}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all mb-1",
                                        isActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="border-t p-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-full"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
}
