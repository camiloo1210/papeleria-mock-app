"use client";

import { UserNav } from "./user-nav";
import { MobileSidebar } from "./mobile-sidebar";


interface HeaderProps {
    email?: string | null;
    tenantId?: number | null;
}

export function Header({ email, tenantId }: HeaderProps) {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:px-6 shrink-0">
            <div className="md:hidden lg:hidden">
                <MobileSidebar />
            </div>
            <div className="w-full flex-1">
                {/* Add search or breadcrumbs here if needed */}
            </div>
            <div className="flex items-center gap-2">
                <UserNav email={email} tenantId={tenantId} />
            </div>
        </header>
    );
}
