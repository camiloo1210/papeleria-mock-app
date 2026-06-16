"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Search, 
  UserPlus, 
  Trash2, 
  UserCheck, 
  Shield, 
  Mail, 
  Sparkles,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "SALES" | "WAREHOUSE";
  status: "Activo" | "Inactivo";
  lastLogin: string;
}

export default function EmployeesDirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "Camilo Administrator", email: "admin@fiado.app", role: "ADMIN", status: "Activo", lastLogin: "Hace 2 horas" },
    { id: 2, name: "María Gerente", email: "maria@fiado.app", role: "MANAGER", status: "Activo", lastLogin: "Hoy, 09:15 AM" },
    { id: 3, name: "Carlos Ventas", email: "carlos@fiado.app", role: "SALES", status: "Inactivo", lastLogin: "Hace 3 días" },
    { id: 4, name: "Ana Bodega", email: "ana@fiado.app", role: "WAREHOUSE", status: "Activo", lastLogin: "Hace 5 mins" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "MANAGER" | "SALES" | "WAREHOUSE">("SALES");

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const newEmp: Employee = {
      id: Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      status: "Activo",
      lastLogin: "Nunca",
    };

    setEmployees([...employees, newEmp]);
    setNewName("");
    setNewEmail("");
    setNewRole("SALES");
    setIsDialogOpen(false);
    toast.success(`${newEmp.name} agregado al directorio de usuarios`);
  };

  const handleRoleChange = (id: number, role: "ADMIN" | "MANAGER" | "SALES" | "WAREHOUSE") => {
    setEmployees(
      employees.map((emp) => (emp.id === id ? { ...emp, role } : emp))
    );
    toast.success("Rol macro actualizado correctamente");
  };

  const handleStatusToggle = (id: number) => {
    setEmployees(
      employees.map((emp) => {
        if (emp.id === id) {
          const nextStatus = emp.status === "Activo" ? "Inactivo" : "Activo";
          toast.success(`Estado de usuario cambiado a ${nextStatus}`);
          return { ...emp, status: nextStatus };
        }
        return emp;
      })
    );
  };

  const handleDeleteEmployee = (id: number, name: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    toast.success(`Usuario ${name} eliminado del directorio`);
  };

  return (
    <div className="flex flex-col gap-6 w-full py-6 max-w-6xl mx-auto px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 rounded-2xl border border-indigo-700/30 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-indigo-500/20">
              Control de Accesos
            </span>
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Directorio de Usuarios</h1>
          <p className="text-indigo-200/80 text-sm">
            Gestiona los empleados de tu negocio y asígnales roles macro para controlar permisos del sistema.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white hover:bg-indigo-50 text-indigo-950 font-bold shadow-lg border border-indigo-200 flex items-center transition-all duration-300 hover:scale-105">
              <UserPlus className="w-4 h-4 mr-2" /> Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-indigo-950 font-bold">
                <UserPlus className="w-5 h-5 text-indigo-600" /> Nuevo Usuario
              </DialogTitle>
              <DialogDescription>
                Ingresa los datos para registrar un nuevo empleado y asignarle su rol macro de seguridad.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Nombre Completo</label>
                <Input 
                  placeholder="Ej. Juan Pérez" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Correo Electrónico</label>
                <Input 
                  type="email"
                  placeholder="juan@negocio.com" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Rol Macro</label>
                <Select 
                  value={newRole} 
                  onValueChange={(val: any) => setNewRole(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN (Acceso Total)</SelectItem>
                    <SelectItem value="MANAGER">MANAGER (Gerente de Sucursal)</SelectItem>
                    <SelectItem value="SALES">SALES (Ventas / Cajero)</SelectItem>
                    <SelectItem value="WAREHOUSE">WAREHOUSE (Gestor de Bodega)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  Registrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
        <div>
          <span className="font-bold">Asignación de Roles Macro:</span> Los cambios de roles se aplican en tiempo real. 
          Para editar políticas específicas de cada rol, dirígete a la <Link href="/protected/settings/roles" className="underline font-semibold hover:text-blue-900">Matriz de Permisos</Link>.
        </div>
      </div>

      {/* Directory Table Card */}
      <Card className="border-gray-200/80 shadow-md overflow-hidden">
        <CardHeader className="pb-4 border-b bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Listado de Personal</CardTitle>
              <CardDescription>
                Muestra todos los usuarios y su estado actual en el sistema.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                type="search" 
                placeholder="Buscar por nombre o email..." 
                className="pl-8 w-full bg-white" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100/50 hover:bg-gray-100/50">
                <TableHead className="font-bold text-gray-700 pl-6">Nombre</TableHead>
                <TableHead className="font-bold text-gray-700">Email</TableHead>
                <TableHead className="font-bold text-gray-700">Rol Macro</TableHead>
                <TableHead className="font-bold text-gray-700">Estado</TableHead>
                <TableHead className="font-bold text-gray-700">Último Acceso</TableHead>
                <TableHead className="font-bold text-gray-700 text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-400" />
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-gray-50/30 transition-colors">
                    <TableCell className="font-semibold text-gray-900 pl-6 flex items-center gap-2 py-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                        {emp.name.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div>
                        <div className="font-bold">{emp.name}</div>
                        <div className="text-xs text-gray-400 font-mono sm:hidden">{emp.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{emp.email}</TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={emp.role}
                        onValueChange={(val: any) => handleRoleChange(emp.id, val)}
                        disabled={emp.role === "ADMIN" && employees.filter(e => e.role === "ADMIN").length === 1}
                      >
                        <SelectTrigger className="w-[150px] font-mono text-xs font-bold border-indigo-100/80 bg-indigo-50/20 text-indigo-900 focus:ring-indigo-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-sans">
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="MANAGER">MANAGER</SelectItem>
                          <SelectItem value="SALES">SALES</SelectItem>
                          <SelectItem value="WAREHOUSE">WAREHOUSE</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleStatusToggle(emp.id)}
                        className="transition-all duration-200 focus:outline-none"
                      >
                        {emp.status === "Activo" ? (
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Inactivo
                          </span>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-medium">{emp.lastLogin}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={emp.role === "ADMIN" && employees.filter(e => e.role === "ADMIN").length === 1}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
