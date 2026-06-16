"use client";

import { useMarketplaceCart } from "@/features/marketplace/application/cart.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCheckoutContextAction } from "@/features/marketplace/actions/get-checkout-context.action";
import { validateCartSuppliersAction, SupplierValidationResult } from "@/features/marketplace/actions/validate-cart-suppliers.action";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Loader2, Store, Truck, CreditCard, Building2, User } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { placeMarketplaceOrderAction } from "@/features/marketplace/actions/place-marketplace-order.action";

export default function CheckoutPage() {
    const items = useMarketplaceCart(state => state.items);
    const clearCart = useMarketplaceCart(state => state.clearCart);

    const total = useMemo(() => {
        return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [items]);

    const itemsBySupplier = useMemo(() => {
        const groups: Record<number, { name: string; items: typeof items }> = {};
        for (const item of items) {
            if (!groups[item.supplierId]) {
                groups[item.supplierId] = { name: item.supplierName, items: [] };
            }
            groups[item.supplierId].items.push(item);
        }
        return groups;
    }, [items]);

    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const [userContext, setUserContext] = useState<{
        isAuthenticated: boolean;
        tenantId?: number;
        businessName?: string;
        userName?: string;
    } | null>(null);

    const [checkoutMode, setCheckoutMode] = useState<'BUSINESS' | 'PERSONAL'>('PERSONAL');

    const [supplierValidation, setSupplierValidation] = useState<Record<number, SupplierValidationResult>>({});

    useEffect(() => {
        getCheckoutContextAction().then(ctx => {
            setUserContext({
                ...ctx,
                tenantId: ctx.tenantId ?? undefined
            });
            if (ctx.tenantId) {
                setCheckoutMode('BUSINESS');
            }
        });
    }, []);

    // Validate suppliers when context changes
    useEffect(() => {
        if (checkoutMode === 'BUSINESS' && userContext?.tenantId && items.length > 0) {
            const supplierIds = Array.from(new Set(items.map(i => Number(i.supplierId))));
            validateCartSuppliersAction(supplierIds, userContext.tenantId).then(setSupplierValidation);
        } else {
            setSupplierValidation({});
        }
    }, [checkoutMode, userContext, items]);

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            const result = await placeMarketplaceOrderAction(items, { mode: checkoutMode });

            if (result.success) {
                toast.success("¡Orden guardada! Redirigiendo a la pasarela de pagos...");
                // Note: we intentionally do not clear the cart yet, so they see the total in the payment gateway
                // clearCart(); 
                router.push('/marketplace/checkout/payment');
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            toast.error("Ocurrió un error inesperado.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Store className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
                <p className="text-gray-500 mb-8 max-w-md">Explora el mercado y encuentra los mejores productos.</p>
                <Link href="/marketplace">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">Explorar Productos</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20">
            <div className="mb-6">
                <Link href="/marketplace" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Seguir comprando
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl font-black text-gray-900">Finalizar Pedido</h1>

                    {userContext?.tenantId && (
                        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm inline-flex">
                            <Tabs value={checkoutMode} onValueChange={(v) => setCheckoutMode(v as 'BUSINESS' | 'PERSONAL')} className="w-[300px]">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="BUSINESS" className="text-xs">
                                        <Building2 className="mr-2 h-3.5 w-3.5" />
                                        Negocio
                                    </TabsTrigger>
                                    <TabsTrigger value="PERSONAL" className="text-xs">
                                        <User className="mr-2 h-3.5 w-3.5" />
                                        Personal
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    )}
                </div>

                {checkoutMode === 'BUSINESS' && userContext?.businessName && (
                    <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-md border border-blue-100 inline-flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                        Comprando como: <strong>{userContext.businessName}</strong>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Order Items grouped by Supplier */}
                <div className="lg:col-span-2 space-y-6">
                    {Object.entries(itemsBySupplier).map(([supplierIdStr, { name, items: supplierItems }]) => {
                        const supplierId = Number(supplierIdStr);
                        const validation = supplierValidation[supplierId];
                        const showWarning = checkoutMode === 'BUSINESS' && validation && !validation.isConnected;

                        return (
                            <Card key={supplierId} className="border-gray-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Store className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Proveedor</CardDescription>
                                                <CardTitle className="text-base font-bold text-gray-900 leading-none mt-0.5">{name}</CardTitle>
                                            </div>
                                        </div>
                                        {showWarning && validation && validation.acceptsSuppliers && (
                                            <Button variant="outline" size="sm" className="text-xs h-7 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800">
                                                Solicitar Conexión
                                            </Button>
                                        )}
                                    </div>
                                    {showWarning && validation && (
                                        <div className={`mt-3 text-xs p-2 rounded border ${validation.acceptsSuppliers ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                            {validation.acceptsSuppliers
                                                ? "⚠️ Estás comprando a precio minorista. Conecta con este proveedor para acceder a precios mayoristas."
                                                : "ℹ️ Este negocio no acepta nuevos proveedores. La compra se procesará a precio minorista."}
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ul className="divide-y divide-gray-100">
                                        {supplierItems.map((item) => (
                                            <li key={item.productId} className="flex p-4 gap-4 hover:bg-gray-50 transition-colors">
                                                <div className="h-16 w-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden relative border border-gray-200">
                                                    {item.imageUrl ? (
                                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-300">
                                                            <Store className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">{item.name}</h4>
                                                    <p className="text-sm text-gray-500 mb-1">Cant: <span className="font-semibold text-gray-700">{item.quantity}</span></p>
                                                    <div className="text-sm font-bold text-indigo-600">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-medium">Subtotal {name}:</span>
                                        <span className="font-bold text-gray-900 text-lg">
                                            ${supplierItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Right: Order Summary Sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card className="border-gray-200 shadow-lg border-t-4 border-t-indigo-600">
                            <CardHeader>
                                <CardTitle className="text-lg">Resumen de Orden</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({items.length} productos)</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Envío estimado</span>
                                        <span className="text-green-600 font-medium">Gratis</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Impuestos</span>
                                        <span>Calculado al final</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-lg">Total a Pagar</span>
                                    <span className="font-black text-2xl text-indigo-600">${total.toFixed(2)}</span>
                                </div>

                                <Button
                                    className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 mt-4"
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            Confirmar Pedido
                                            <CreditCard className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                                    <Truck className="h-3 w-3" />
                                    <span>Envíos asegurados por Papelería El Estudiante</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
