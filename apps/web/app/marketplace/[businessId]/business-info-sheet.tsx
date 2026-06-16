'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useState } from "react";

interface Props {
    businessId: number;
    tradeName: string;
    ratingAverage: number;
    ratingCount: number;
    children: React.ReactNode;
}

export function BusinessInfoSheet({ businessId: _businessId, tradeName, ratingAverage, ratingCount, children }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm">
                    <Info className="h-4 w-4" />
                    Ver Información y Reseñas
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>{tradeName}</SheetTitle>
                </SheetHeader>

                <div className="space-y-8 pb-10">
                    {/* Info Card */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-gray-900">Información</h3>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between pb-3 border-b border-gray-200">
                                <span className="text-gray-500">Horario</span>
                                <span className="font-medium text-green-600">Abierto ahora</span>
                            </div>
                            <div className="flex justify-between pb-3 border-b border-gray-200">
                                <span className="text-gray-500">Entrega</span>
                                <span className="font-medium text-gray-900">20-30 min</span>
                            </div>
                            <div className="flex justify-between pb-3 border-b border-gray-200">
                                <span className="text-gray-500">Costo envío</span>
                                <span className="font-medium text-gray-900">Gratis</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-gray-500">Calificación</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-500 font-bold">★ {ratingAverage > 0 ? ratingAverage.toFixed(1) : 'Nuevo'}</span>
                                    {ratingCount > 0 && <span className="text-gray-400">({ratingCount})</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ratings Section (Server Component passed as child) */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-900">Opiniones y Reseñas</h3>
                        {children}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
