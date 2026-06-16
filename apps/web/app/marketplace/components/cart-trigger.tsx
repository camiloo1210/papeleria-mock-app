"use client";

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useMarketplaceCart, selectCartItemCount } from '@/features/marketplace/application/cart.store';

export function CartTrigger() {
    const itemCount = useMarketplaceCart(selectCartItemCount);
    const setIsOpen = useMarketplaceCart(state => state.setIsOpen);

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-indigo-600"
            onClick={() => setIsOpen(true)}
        >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {itemCount}
                </span>
            )}
        </Button>
    );
}
