"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  ArrowLeft,
  ShoppingBag,
  ChevronRight
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  itemsCount: number;
  businessName: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-4589",
    date: "2024-01-15",
    total: 125.50,
    status: "pending",
    itemsCount: 3,
    businessName: "Papelería El Estudiante"
  },
  {
    id: "2",
    orderNumber: "ORD-4590",
    date: "2024-01-14",
    total: 86.00,
    status: "processing",
    itemsCount: 2,
    businessName: "Papelería El Estudiante"
  },
  {
    id: "3",
    orderNumber: "ORD-4588",
    date: "2024-01-13",
    total: 210.00,
    status: "completed",
    itemsCount: 5,
    businessName: "Papelería El Estudiante"
  },
  {
    id: "4",
    orderNumber: "ORD-4587",
    date: "2024-01-12",
    total: 45.00,
    status: "cancelled",
    itemsCount: 1,
    businessName: "Papelería El Estudiante"
  }
];

const statusConfig = {
  pending: { 
    label: "Pendiente de Pago", 
    icon: Clock, 
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    iconColor: "text-yellow-600"
  },
  processing: { 
    label: "En Proceso", 
    icon: Truck, 
    color: "bg-blue-100 text-blue-700 border-blue-200",
    iconColor: "text-blue-600"
  },
  completed: { 
    label: "Completado", 
    icon: CheckCircle2, 
    color: "bg-green-100 text-green-700 border-green-200",
    iconColor: "text-green-600"
  },
  cancelled: { 
    label: "Cancelado", 
    icon: XCircle, 
    color: "bg-red-100 text-red-700 border-red-200",
    iconColor: "text-red-600"
  }
};

export default function MarketplaceOrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);

  const getStatusConfig = (status: Order["status"]) => statusConfig[status];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/marketplace" className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-500 mt-1">Historial de tus compras en el marketplace</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No tienes pedidos aún</h2>
            <p className="text-gray-500 mb-6">Explora el catálogo y realiza tu primera compra</p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/marketplace/mock-biz-00000000-0000-0000-0000-000000000001">
                Ver Catálogo
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {orders.map((order) => {
            const status = getStatusConfig(order.status);
            const StatusIcon = status.icon;
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-100 p-3 rounded-xl">
                        <Package className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <Badge variant="outline" className={`${status.color} border`}>
                            <StatusIcon className={`w-3 h-3 mr-1 ${status.iconColor}`} />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {order.businessName} • {order.itemsCount} productos
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.date).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                      <Link 
                        href={`/marketplace/orders/${order.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-end gap-1 mt-2"
                      >
                        Ver detalles <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}