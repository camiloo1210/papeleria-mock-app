import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    productId: number;
    quantity: number;
    price: number;
    name: string;
    imageUrl?: string;
    supplierId: number;
    supplierName: string;
    stock: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    addItem: (item: CartItem) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    // Computed getters are usually implemented as hooks or derived state in component, 
    // but we can add helper methods if needed.
}

export const useMarketplaceCart = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            isOpen: false,
            setIsOpen: (isOpen) => set({ isOpen }),
            addItem: (newItem) => set((state) => {
                const existingItem = state.items.find(i => i.productId === newItem.productId);
                if (existingItem) {
                    return {
                        items: state.items.map(i =>
                            i.productId === newItem.productId
                                ? { ...i, quantity: i.quantity + newItem.quantity }
                                : i
                        )
                    };
                }
                return { items: [...state.items, newItem] };
            }),
            removeItem: (productId) => set((state) => ({
                items: state.items.filter(i => i.productId !== productId)
            })),
            updateQuantity: (productId, quantity) => set((state) => ({
                items: quantity <= 0
                    ? state.items.filter(i => i.productId !== productId)
                    : state.items.map(i => i.productId === productId ? { ...i, quantity } : i)
            })),
            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'marketplace-cart-storage',
        }
    )
);

// Selectors
export const selectCartTotal = (state: CartState) => state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
export const selectCartItemCount = (state: CartState) => state.items.reduce((acc, item) => acc + item.quantity, 0);
export const selectCartItemsBySupplier = (state: CartState) => {
    const groups: Record<number, { name: string; items: CartItem[] }> = {};
    for (const item of state.items) {
        if (!groups[item.supplierId]) {
            groups[item.supplierId] = { name: item.supplierName, items: [] };
        }
        groups[item.supplierId].items.push(item);
    }
    return groups;
};
