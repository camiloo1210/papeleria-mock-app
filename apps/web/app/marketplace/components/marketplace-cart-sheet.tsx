"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MarketplaceCartSidebar } from "@/features/procurement/ui/marketplace-cart-sidebar";
import { useMarketplaceCart, selectCartTotal } from "@/features/marketplace/application/cart.store";
import { useRouter } from "next/navigation";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function MarketplaceCartSheet() {
    const isOpen = useMarketplaceCart(state => state.isOpen);
    const setIsOpen = useMarketplaceCart(state => state.setIsOpen);
    const cart = useMarketplaceCart(state => state.items);
    const removeItem = useMarketplaceCart(state => state.removeItem);
    const updateQuantity = useMarketplaceCart(state => state.updateQuantity);
    const clearCart = useMarketplaceCart(state => state.clearCart);
    const total = useMarketplaceCart(selectCartTotal);

    const router = useRouter();

    const handleConfirmOrder = () => {
        setIsOpen(false);
        router.push('/marketplace/checkout');
    };

    // Adapt cart items to format expected by MarketplaceCartSidebar (PosCartItem)
    const posCartItems = cart.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        stock: item.stock,
        hasVariants: false,
    }));

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-[400px] sm:w-[450px] p-0" side="right">
                <VisuallyHidden>
                    <SheetTitle>Carrito de Compras</SheetTitle>
                </VisuallyHidden>
                <MarketplaceCartSidebar
                    cart={posCartItems}
                    total={total}
                    onRemoveItem={removeItem}
                    onUpdateQuantity={updateQuantity}
                    onClearCart={clearCart}
                    onConfirmOrder={handleConfirmOrder}
                    isProcessing={false}
                />
            </SheetContent>
        </Sheet>
    );
}
