"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  ArrowUpRight, 
  Boxes, 
  Tags, 
  Package, 
  Save, 
  PlusCircle,
  TrendingDown,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  wholesale: number;
  stock: number;
  minAlert: number;
  status: "active" | "low_stock" | "out_of_stock";
}

interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

export default function ProductsManagementPage() {
  const [activeTab, setActiveTab] = useState("catalog");
  
  // Product state
  const [products, setProducts] = useState<Product[]>([
    { id: "PRD-001", sku: "CUA-NOR100", name: "Cuaderno Norma 100 Hojas", category: "Cuadernos", price: 6.50, wholesale: 5.50, stock: 150, minAlert: 20, status: "active" },
    { id: "PRD-002", sku: "BOL-BIC-AZ", name: "Bolígrafo Bic Cristal Azul", category: "Escritura", price: 1.20, wholesale: 1.00, stock: 480, minAlert: 50, status: "active" },
    { id: "PRD-003", sku: "RES-REP-CAR", name: "Resma Papel Carta Reprograf", category: "Oficina", price: 22.00, wholesale: 18.50, stock: 30, minAlert: 10, status: "active" },
    { id: "PRD-004", sku: "COL-PRI-12", name: "Caja Colores Prismacolor x12", category: "Arte", price: 28.00, wholesale: 24.50, stock: 0, minAlert: 15, status: "out_of_stock" },
    { id: "PRD-005", sku: "MAR-SHA-4", name: "Marcadores Sharpie x4", category: "Arte", price: 18.50, wholesale: 15.50, stock: 15, minAlert: 20, status: "low_stock" },
    { id: "PRD-006", sku: "CAL-CIEN", name: "Calculadora Científica", category: "Oficina", price: 85.00, wholesale: 75.00, stock: 33, minAlert: 5, status: "active" },
  ]);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Cuadernos y Libretas", slug: "cuadernos", productCount: 15 },
    { id: 2, name: "Escritura", slug: "escritura", productCount: 28 },
    { id: 3, name: "Oficina", slug: "oficina", productCount: 12 },
    { id: 4, name: "Arte y Diseño", slug: "arte", productCount: 9 },
    { id: 5, name: "Papelería General", slug: "papeleria", productCount: 42 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  
  // Inventory edits mapping: productSku -> quantity
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const handleAdjustStockChange = (sku: string, val: string) => {
    const num = Number(val);
    setAdjustments({
      ...adjustments,
      [sku]: isNaN(num) ? 0 : num
    });
  };

  const handleApplyAdjustment = (sku: string) => {
    const diff = adjustments[sku] || 0;
    if (diff === 0) return;

    setProducts(products.map(p => {
      if (p.sku === sku) {
        const newStock = Math.max(0, p.stock + diff);
        let nextStatus: "active" | "low_stock" | "out_of_stock" = "active";
        if (newStock === 0) nextStatus = "out_of_stock";
        else if (newStock <= p.minAlert) nextStatus = "low_stock";

        toast.success(`Inventario de ${p.name} ajustado por ${diff > 0 ? `+${diff}` : diff} unidades`);
        return { ...p, stock: newStock, status: nextStatus };
      }
      return p;
    }));

    // Clear adjustment input
    setAdjustments({ ...adjustments, [sku]: 0 });
  };

  const handleMinAlertChange = (sku: string, val: number) => {
    setProducts(products.map(p => {
      if (p.sku === sku) {
        let nextStatus: "active" | "low_stock" | "out_of_stock" = p.status;
        if (p.stock > 0) {
          nextStatus = p.stock <= val ? "low_stock" : "active";
        }
        return { ...p, minAlert: val, status: nextStatus };
      }
      return p;
    }));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const slug = newCatSlug || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    if (categories.some(c => c.slug === slug)) {
      toast.error("Ya existe una categoría con este slug/nombre");
      return;
    }

    const newCat: Category = {
      id: Date.now(),
      name: newCatName,
      slug,
      productCount: 0
    };

    setCategories([...categories, newCat]);
    setNewCatName("");
    setNewCatSlug("");
    toast.success(`Categoría "${newCat.name}" agregada exitosamente`);
  };

  const handleDeleteCategory = (id: number, name: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success(`Categoría "${name}" eliminada`);
  };

  const handleDeleteProduct = (sku: string, name: string) => {
    setProducts(products.filter(p => p.sku !== sku));
    toast.success(`Producto "${name}" eliminado del catálogo`);
  };

  const filteredProducts = products.filter(
    p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full py-6 max-w-6xl mx-auto px-4 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700/30 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-indigo-500/20">
              Operaciones
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Gestión de Catálogo</h1>
          <p className="text-slate-200/80 text-sm">
            Controla tu catálogo, niveles mínimos de alertas de stock y organiza los productos por categorías.
          </p>
        </div>
        <Link href="/protected/products/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg flex items-center transition-all duration-300 hover:scale-105">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Tabs Switcher */}
      <Tabs defaultValue="catalog" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl w-full sm:w-auto grid grid-cols-3 gap-1 mb-4">
          <TabsTrigger value="catalog" className="rounded-lg font-semibold text-sm py-2">
            <Package className="w-4 h-4 mr-2" /> Productos
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg font-semibold text-sm py-2">
            <Boxes className="w-4 h-4 mr-2" /> Niveles de Inventario
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg font-semibold text-sm py-2">
            <Tags className="w-4 h-4 mr-2" /> Categorías
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Catalog */}
        <TabsContent value="catalog">
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Total SKU Activos</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-gray-400">En catálogo de negocio</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-amber-600">Stock Bajo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {products.filter(p => p.status === "low_stock").length}
                </div>
                <p className="text-xs text-amber-500">Requieren reposición</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-red-600">Agotado</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.status === "out_of_stock").length}
                </div>
                <p className="text-xs text-red-500">Sin unidades disponibles</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200/80 shadow-md">
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg font-bold text-gray-900">Catálogo de Productos</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-[260px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      type="search" 
                      placeholder="Buscar por SKU o Nombre..." 
                      className="pl-8 bg-white" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-[120px] font-bold pl-6">SKU</TableHead>
                    <TableHead className="font-bold">Producto</TableHead>
                    <TableHead className="font-bold">Categoría</TableHead>
                    <TableHead className="text-right font-bold">Precio Unitario</TableHead>
                    <TableHead className="text-right font-bold text-indigo-700">Precio Mayorista</TableHead>
                    <TableHead className="text-right font-bold">Stock</TableHead>
                    <TableHead className="text-right font-bold pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.sku} className="hover:bg-gray-50/20 transition-colors">
                      <TableCell className="font-mono text-xs text-gray-500 pl-6">{product.sku}</TableCell>
                      <TableCell className="font-bold text-gray-900">{product.name}</TableCell>
                      <TableCell><Badge variant="outline" className="border-indigo-100 text-indigo-800 bg-indigo-50/20">{product.category}</Badge></TableCell>
                      <TableCell className="text-right font-medium">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-indigo-700">${product.wholesale.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          product.status === "out_of_stock" ? "text-red-600" : product.status === "low_stock" ? "text-amber-600" : "text-green-600"
                        }`}>
                          {product.stock}
                          {product.status === "out_of_stock" && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                          {product.status === "low_stock" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <Link href={`/protected/products/edit/${product.sku}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(product.sku, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Inventory Levels */}
        <TabsContent value="inventory">
          <Card className="border-gray-200/80 shadow-md">
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <CardTitle className="text-lg font-bold text-gray-900">Gestión de Stock y Alertas</CardTitle>
              <CardDescription>
                Ajusta los niveles de inventario directamente y configura los umbrales de alerta de stock bajo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-[120px] font-bold pl-6">SKU</TableHead>
                    <TableHead className="font-bold">Producto</TableHead>
                    <TableHead className="text-center font-bold">Stock Mín. Alerta</TableHead>
                    <TableHead className="text-right font-bold w-[120px]">Stock Actual</TableHead>
                    <TableHead className="text-center font-bold w-[200px]">Ajustar Stock</TableHead>
                    <TableHead className="text-right font-bold pr-6">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => (
                    <TableRow key={p.sku} className="hover:bg-gray-50/20 transition-colors">
                      <TableCell className="font-mono text-xs text-gray-500 pl-6">{p.sku}</TableCell>
                      <TableCell className="font-bold text-gray-900">{p.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Input 
                            type="number" 
                            className="w-16 h-8 text-center text-xs font-bold" 
                            value={p.minAlert}
                            onChange={(e) => handleMinAlertChange(p.sku, Number(e.target.value))}
                          />
                          <span className="text-xs text-gray-400">un.</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={p.status === "out_of_stock" ? "text-red-600" : p.status === "low_stock" ? "text-amber-600" : "text-green-600"}>
                          {p.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAdjustStockChange(p.sku, "-10")}
                            className="h-8 px-2 text-xs"
                          >
                            -10
                          </Button>
                          <Input 
                            type="number" 
                            placeholder="Cant." 
                            className="w-16 h-8 text-center text-xs font-bold" 
                            value={adjustments[p.sku] || ""}
                            onChange={(e) => handleAdjustStockChange(p.sku, e.target.value)}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAdjustStockChange(p.sku, "+10")}
                            className="h-8 px-2 text-xs"
                          >
                            +10
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          onClick={() => handleApplyAdjustment(p.sku)}
                          disabled={!adjustments[p.sku]}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-3"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" /> Aplicar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Categories */}
        <TabsContent value="categories">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Add Category Form */}
            <Card className="border-gray-200/80 shadow-md h-fit">
              <CardHeader className="bg-gray-50/50 border-b pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-600" /> Nueva Categoría
                </CardTitle>
                <CardDescription>Crea una nueva clasificación para organizar tus productos.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Nombre de la Categoría</label>
                    <Input 
                      placeholder="Ej. Artículos Escolares" 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Slug (URL corta - Opcional)</label>
                    <Input 
                      placeholder="ej-articulos-escolares" 
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">
                    Crear Categoría
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Categories list */}
            <Card className="col-span-2 border-gray-200/80 shadow-md">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-lg font-bold text-gray-900">Listado de Categorías</CardTitle>
                <CardDescription>Muestra las clasificaciones y la cantidad de productos asociados.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-bold pl-6">Nombre</TableHead>
                      <TableHead className="font-bold">Slug URL</TableHead>
                      <TableHead className="text-center font-bold">Productos Relacionados</TableHead>
                      <TableHead className="text-right font-bold pr-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((c) => (
                      <TableRow key={c.id} className="hover:bg-gray-50/20 transition-colors">
                        <TableCell className="font-bold text-gray-900 pl-6">{c.name}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">{c.slug}</TableCell>
                        <TableCell className="text-center font-semibold text-indigo-700 font-mono">
                          {c.productCount}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteCategory(c.id, c.name)}
                            disabled={c.productCount > 0}
                            title={c.productCount > 0 ? "No puedes eliminar una categoría con productos asignados" : "Eliminar"}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
