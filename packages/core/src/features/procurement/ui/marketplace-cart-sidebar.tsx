"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
export interface PosCartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

import Image from 'next/image';

interface MarketplaceCartSidebarProps {
    cart: PosCartItem[];
    total: number;
    onRemoveItem: (id: number) => void;
    onUpdateQuantity: (id: number, qty: number) => void;
    onClearCart: () => void;
    onConfirmOrder: () => void;
    isProcessing: boolean;
}

export function MarketplaceCartSidebar({
    cart,
    total,
    onRemoveItem,
    onUpdateQuantity,
    onClearCart,
    onConfirmOrder,
    isProcessing
}: MarketplaceCartSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-background border-l w-[400px] shadow-xl">
            {/* Header */}
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Resumen del Pedido
                </h2>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 p-4">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50 min-h-[200px]">
                        <div className="text-5xl">📦</div>
                        <p>No has seleccionado productos</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-card p-2 rounded-lg border shadow-sm">
                                <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground relative overflow-hidden">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        "IMG"
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                                    <p className="text-sm text-primary font-bold">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline" size="icon" className="h-7 w-7"
                                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                        <span className="sr-only">Decrease quantity</span>
                                    </Button>
                                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                    <Button
                                        variant="outline" size="icon" className="h-7 w-7"
                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                        <span className="sr-only">Increase quantity</span>
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove item</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer: Totals & Action */}
            <div className="p-4 border-t bg-muted/10 space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    {/* Assuming tax is handled later or included */}
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total Estimado</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="destructive"
                        className="h-12 text-base font-semibold"
                        onClick={onClearCart}
                        disabled={cart.length === 0}
                    >
                        Limpiar
                    </Button>
                    <Button
                        className="h-12 text-base font-semibold"
                        onClick={onConfirmOrder}
                        disabled={isProcessing || cart.length === 0}
                    >
                        {isProcessing ? "Procesando..." : "Finalizar Compra"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
