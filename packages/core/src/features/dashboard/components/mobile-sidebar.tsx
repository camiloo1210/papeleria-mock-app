"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Store,
    Package,
    ShoppingCart,
    CreditCard,
    MapPin,
    Users,
    BarChart3,
    Settings,
    Calendar,
    Layers,
    UserCircle
} from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    if (!mounted) return null;
    if (isDesktop) return null;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 !md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <SheetTitle className="sr-only">Menu de Navegación</SheetTitle>
                <div className="h-full [&>div]:w-full [&>div]:border-r-0 [&>div]:bg-transparent">
                    <div className="h-full max-h-screen flex-col gap-2 flex">
                        <SidebarContent />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/protected",
        icon: LayoutDashboard,
    },
    {
        title: "Negocio",
        href: "/business",
        icon: Store,
    },
    {
        title: "Sucursales",
        href: "/business/branch",
        icon: MapPin,
    },
    {
        title: "Productos",
        href: "/products",
        icon: Package,
    },
    {
        title: "Categorías",
        href: "/categories",
        icon: Layers,
    },
    {
        title: "Ventas",
        href: "/sales/orders",
        icon: ShoppingCart,
    },
    {
        title: "Temporadas",
        href: "/seasons",
        icon: Calendar,
    },
    {
        title: "Empleados",
        href: "/employees",
        icon: Users,
    },
    {
        title: "Clientes",
        href: "/clients",
        icon: UserCircle,
    },
    {
        title: "BI Dashboard",
        href: "/protected/bi",
        icon: BarChart3,
    },
    {
        title: "Suscripción",
        href: "/subscription-plans",
        icon: CreditCard,
    },
    {
        title: "Cuenta",
        href: "/account",
        icon: Settings,
    },
];

function SidebarContent() {
    const pathname = usePathname();
    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Store className="h-6 w-6" />
                    <span className="">Papelería El Estudiante</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    )
}
