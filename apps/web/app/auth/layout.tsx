
import { MarketplaceThemeReset } from '@/features/shared/theme/marketplace-theme-reset';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main className="h-screen overflow-y-auto">
            <MarketplaceThemeReset />
            {children}
        </main>
    );
}
