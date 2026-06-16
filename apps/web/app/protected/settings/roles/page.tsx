import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Save, ShieldAlert } from "lucide-react";

export default function RolesPermissionsPage() {
  const roles = ["ADMIN", "MANAGER", "SALES", "WAREHOUSE"];
  
  const permissions = [
    { module: "Dashboard & BI", perms: ["Ver Dashboard Operativo", "Exportar Reportes"] },
    { module: "Catálogo", perms: ["Ver Productos", "Crear/Editar Productos", "Ajustar Precios", "Ajustar Inventario"] },
    { module: "Ventas y Pedidos", perms: ["Ver Pedidos", "Aprobar Pedidos", "Cancelar Pedidos", "Configurar Pasarela de Pagos"] },
    { module: "Configuración", perms: ["Gestionar Usuarios", "Editar Perfil del Negocio", "Configurar WhatsApp"] },
  ];

  const getCheckedState = (role: string, perm: string) => {
    if (role === "ADMIN") return true; // Admin has all
    if (role === "MANAGER") {
      return !perm.includes("Configurar Pasarela") && !perm.includes("Gestionar Usuarios");
    }
    if (role === "SALES") {
      return perm.includes("Ver Productos") || perm.includes("Ver Pedidos") || perm.includes("Aprobar Pedidos");
    }
    if (role === "WAREHOUSE") {
      return perm.includes("Ver Productos") || perm.includes("Ajustar Inventario") || perm.includes("Ver Pedidos");
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-6 w-full py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matriz de Permisos</h1>
          <p className="text-muted-foreground mt-1">
            Asigna permisos granulares a cada uno de los roles macro del sistema.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Save className="w-4 h-4 mr-2" /> Guardar Matriz
        </Button>
      </div>

      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <ShieldAlert className="w-5 h-5 text-indigo-600" /> Control de Acceso (RBAC)
          </CardTitle>
          <CardDescription>
            Marca las casillas para otorgar o revocar permisos. El rol ADMIN no puede ser restringido.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[300px] font-bold text-gray-900">Módulo / Permiso</TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center font-bold">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-mono border">
                      {role}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((group, i) => (
                <React.Fragment key={i}>
                  <TableRow className="bg-gray-50/80">
                    <TableCell colSpan={roles.length + 1} className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                      {group.module}
                    </TableCell>
                  </TableRow>
                  {group.perms.map(perm => (
                    <TableRow key={perm} className="hover:bg-transparent">
                      <TableCell className="pl-6 text-sm text-gray-600">{perm}</TableCell>
                      {roles.map(role => (
                        <TableCell key={`${role}-${perm}`} className="text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600 disabled:opacity-50"
                            defaultChecked={getCheckedState(role, perm)}
                            disabled={role === "ADMIN"}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Small workaround for React.Fragment import missing
import React from 'react';
