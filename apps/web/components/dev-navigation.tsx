"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DevNavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const routes = [
    { name: "1. WhatsApp Admin", url: "/protected/settings/whatsapp" },
    { name: "1. WhatsApp Chat", url: "/whatsapp-simulator" },
    { name: "2. Catálogo", url: "/marketplace/mock-biz-00000000-0000-0000-0000-000000000001" },
    { name: "2. Detalle Prod", url: "/marketplace/mock-biz-00000000-0000-0000-0000-000000000001/products/prod-uuid-00000000-0000-0000-0000-000000000001" },
    { name: "3. Checkout", url: "/marketplace/checkout" },
    { name: "3. Pasarela Pago", url: "/marketplace/checkout/payment" },
    { name: "3. Órdenes (Admin)", url: "/protected/sales/orders" },
    { name: "4. Dashboard", url: "/protected" },
    { name: "4. Gráficos BI", url: "/protected/bi" },
    { name: "5. Empleados", url: "/protected/settings/employees" },
    { name: "5. Roles Matrix", url: "/protected/settings/roles" },
    { name: "5. Mi Perfil", url: "/marketplace/profile" },
    { name: "6. Catálogo Admin", url: "/protected/products" },
    { name: "6. Form Producto", url: "/protected/products/create" },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-xl rounded-full h-14 px-6 flex items-center gap-2"
        >
          <Camera className="w-5 h-5" />
          <span className="font-bold">Menú de Capturas</span>
          <ChevronUp className="w-5 h-5 ml-2" />
        </Button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-80 overflow-hidden flex flex-col">
          <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold">
              <Camera className="w-5 h-5" /> Rutas para Figuras
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-purple-500 rounded"><ChevronDown className="w-5 h-5" /></button>
              <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-purple-500 rounded"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-1">
              {routes.map((route, i) => (
                <Link key={i} href={route.url} onClick={() => setIsOpen(false)}>
                  <div className="px-4 py-2 hover:bg-purple-50 rounded-lg text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors border border-transparent hover:border-purple-100">
                    {route.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-3 text-xs text-center text-gray-500 border-t">
            Cierra el menú al capturar (X para ocultar permanente)
          </div>
        </div>
      )}
    </div>
  );
}
