import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, CheckCircle, Clock, XCircle } from "lucide-react";

export default function OrdersManagementPage() {
  const orders = [
    { id: "ORD-4589", customer: "Colegio San Francisco", date: "14 Jun 2026, 09:30 AM", total: 185000, status: "pending", items: 45 },
    { id: "ORD-4588", customer: "Oficinas Centrales Ltda", date: "13 Jun 2026, 16:45 PM", total: 1250000, status: "completed", items: 120 },
    { id: "ORD-4587", customer: "Librería Central", date: "13 Jun 2026, 11:20 AM", total: 89500, status: "completed", items: 12 },
    { id: "ORD-4586", customer: "Universidad Mayor", date: "12 Jun 2026, 14:15 PM", total: 420000, status: "cancelled", items: 35 },
    { id: "ORD-4585", customer: "Papelería La Esquina", date: "12 Jun 2026, 08:00 AM", total: 2100000, status: "completed", items: 300 },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Pendiente</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Completado</Badge>;
      case 'cancelled': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1"/> Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            Bandeja centralizada para administrar las órdenes de tus clientes mayoristas.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Exportar Reporte</Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Órdenes Recientes</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Buscar pedido..." className="pl-8 w-[250px]" />
              </div>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px]">ID Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead className="text-right">Artículos</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-indigo-600">{order.id}</TableCell>
                  <TableCell className="font-semibold">{order.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  <TableCell className="text-right">{order.items}</TableCell>
                  <TableCell className="text-right font-bold">${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="hover:bg-indigo-50 hover:text-indigo-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
