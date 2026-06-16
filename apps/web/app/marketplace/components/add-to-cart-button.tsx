"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMarketplaceCart } from "@/features/marketplace/application/cart.store";
import { toast } from "sonner";
import { Plus, Minus, ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
    productId: number;
    name: string;
    price: number;
    wholesalePrice: number;
    imageUrl?: string;
    supplierId: number;
    supplierName: string;
    stock: number;
}

export function AddToCartButton({
    productId,
    name,
    price,
    wholesalePrice,
    imageUrl,
    supplierId,
    supplierName,
    stock
}: AddToCartButtonProps) {
    const [quantity, setQuantity] = useState(1);
    const addItem = useMarketplaceCart((state) => state.addItem);

    const handleAddToCart = () => {
        addItem({
            productId,
            quantity,
            price: wholesalePrice,
            name,
            imageUrl,
            supplierId,
            supplierName,
            stock
        });
        toast.success(`${quantity}x ${name} añadido al carrito`);
        setQuantity(1);
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-xl overflow-hidden h-14">
                <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 text-gray-500 hover:bg-gray-100 h-full font-bold text-xl"
                >
                    <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    className="px-4 text-gray-500 hover:bg-gray-100 h-full font-bold text-xl"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <Button
                onClick={handleAddToCart}
                className="flex-1 h-14 text-lg font-bold rounded-xl"
                size="lg"
            >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Agregar al Carrito - ${(wholesalePrice * quantity).toFixed(2)}
            </Button>
        </div>
    );
}
