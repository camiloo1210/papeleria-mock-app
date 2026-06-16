import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  Layers,
  UserCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Permission } from '@/features/permissions/domain/permissions';
import { createClient } from '@/lib/supabase/server';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> employee (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabaseEmployeeRepository } from '@/features/employee/infrastructure/supabase-employee.repository';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> rol (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabaseRolRepository } from '@/features/rol/infrastructure/supabase-rol.repository';
import { SupabaseBiRepository } from '@/features/bi/infrastructure/supabase-bi.repository';
import { DashboardBranchSelector } from '@/features/dashboard/components/dashboard-branch-selector';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Define features explicitly with permissions
const features = [
  {
    title: 'Ventas',
    description: 'Administra tus órdenes y transacciones.',
    href: '/protected/sales/orders',
    icon: ShoppingCart,
    color: "text-green-500",
    bg: "bg-green-500/10",
    requiredPermission: Permission.SALES_VIEW,
  },
  {
    title: 'Productos',
    description: 'Gestiona tu inventario y catálogo.',
    href: '/products',
    icon: Package,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    requiredPermission: Permission.PRODUCTS_VIEW,
  },
  {
    title: 'Clientes',
    description: 'Administra la lista de clientes.',
    href: '/clients',
    icon: UserCircle,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    requiredPermission: Permission.CLIENTS_VIEW,
  },
  {
    title: 'Empleados',
    description: 'Gestiona el equipo de trabajo.',
    href: '/employees',
    icon: Users,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    requiredPermission: Permission.EMPLOYEES_VIEW,
  },
  {
    title: 'BI Dashboard',
    description: 'Análisis y reportes de rendimiento.',
    href: '/protected/bi',
    icon: BarChart3,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    requiredPermission: Permission.BI_VIEW,
  },
  {
    title: 'Suscripción',
    description: 'Detalles de tu plan actual.',
    href: '/subscription-plans',
    icon: CreditCard,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    requiredPermission: Permission.ROLES_MANAGE,
  },
];

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. Setup Supabase Client (Standard for Auth)
  // 1. Setup Supabase Client (Standard for Auth)
  const supabase = await createClient();
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.warn("Dashboard Auth Check Failed (Offline?):", error);
    // Do not redirect here. Let the code fall through.
    // However, if we don't have a user, we can't fetch server data.
    // We should return a Client Component that handles Offline View.
  }

  if (!user) {
    // If we are strictly offline and cached, this code might not even run.
    // But if we hit the server and it fails to validate, we return a "Shell".
    // This shell will try to hydrate.
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-xl font-bold">Offline Mode</h1>
        <p className="text-muted-foreground">Unable to connect to server. Viewing local data.</p>
        <Button asChild>
          <Link href="/protected/sales/orders/create">Go to POS (Offline Capable)</Link>
        </Button>
      </div>
    );
  }

  const rawServiceRoleClient = createServiceRoleClient();

  // 3. Fetch User Data
  const { data: userData, error: userError } = await rawServiceRoleClient
    .schema('core')
    .from('users')
    .select('id, tenant_id, person_id')
    .eq('uuid', user.id)
    .single();

  if (userError || !userData) {
    console.error('[Dashboard Error] Failed to fetch user:', JSON.stringify(userError, null, 2));
    return <div className="p-4 text-red-500">Error loading user profile.</div>;
  }

  const tenantId = userData.tenant_id;
  const userId = userData.id;

  // 4. Fetch Employee & Role Data FIRST to determine View
  const employeeRepo = new SupabaseEmployeeRepository(rawServiceRoleClient);
  const rolRepo = new SupabaseRolRepository(rawServiceRoleClient);
  const biRepository = new SupabaseBiRepository(rawServiceRoleClient);

  const currentEmployee = await employeeRepo.findByUserId(userId, tenantId);

  let isEmployee = false;
  let isBranchLocked = false;
  let defaultBranchId: number | undefined = undefined;
  let permissions: string[] = [];
  let roleName = '';

  if (currentEmployee) {
    const roleId = currentEmployee.getRoleId();
    const position = currentEmployee.getPosition();
    const role = await rolRepo.findById(roleId);
    roleName = role?.toPrimitives().name || '';

    if (roleId === 2 || position === 'EMPLOYEE' || roleName.toUpperCase() === 'EMPLOYEE') {
      isEmployee = true;
    }

    if (!isEmployee) {
      permissions = await employeeRepo.getRolePermissions(roleId);
    }

    // Manager Logic
    if (roleName === 'MANAGER') {
      isBranchLocked = true;
      const primitives = currentEmployee.toPrimitives();
      if (primitives.branch_id) {
        defaultBranchId = primitives.branch_id;
      }
    }
  }

  // 5. Conditional Data Fetching
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Common Data (Person)
  const personPromise = rawServiceRoleClient
    .schema('shared')
    .from('person')
    .select('first_name, last_name')
    .eq('id', userData.person_id)
    .maybeSingle();

  if (isEmployee) {
    // --- SALESPERSON VIEW DATA ---
    // Fetch only my sales for today
    const [personRes, mySalesRes] = await Promise.all([
      personPromise,
      rawServiceRoleClient
        .schema('core')
        .from('orders')
        .select('total, id')
        .eq('tenant_id', tenantId)
        .eq('employee_id', currentEmployee?.getId())
        .gte('created_at', todayStart.toISOString())
    ]);

    const firstName = personRes.data?.first_name || 'Vendedor';
    const mySales = mySalesRes.data || [];
    const mySalesCount = mySales.length;

    return (
      <div className="flex flex-col gap-8 pb-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hola, {firstName} 👋</h1>
            <p className="text-muted-foreground mt-1">Aquí tienes tu resumen de ventas de hoy.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* KPI SECTION - RESTRICTED */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Ventas de Hoy</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mySalesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {mySalesCount === 1 ? 'venta realizada' : 'ventas realizadas'}
              </p>
            </CardContent>
          </Card>

          {/* Quick Action to POS */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-center">
            <CardContent className="py-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Nueva Venta</h3>
                <p className="text-sm text-muted-foreground">Ir al punto de venta</p>
              </div>
              <Button asChild>
                <Link href="/protected/sales/orders/create">
                  Abrir POS <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- ADMIN/MANAGER VIEW DATA ---

  // Determine Effective Branch ID for Admin/Manager
  const resolvedSearchParams = await searchParams;
  let branchIdParam = resolvedSearchParams.branchId ? Number(resolvedSearchParams.branchId) : undefined;

  if (isBranchLocked && defaultBranchId) {
    branchIdParam = defaultBranchId;
  }

  const branchId = branchIdParam && !isNaN(branchIdParam) ? branchIdParam : undefined;

  // Prepare queries
  const productsQuery = rawServiceRoleClient
    .schema('core')
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .neq('status', 'archived');

  const clientsQuery = rawServiceRoleClient
    .schema('core')
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  const lowStockQuery = rawServiceRoleClient
    .schema('core')
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .lt('stock', 5)
    .neq('status', 'archived');

  const recentOrdersQuery = rawServiceRoleClient
    .schema('core')
    .from('orders')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5);

  const [
    personRes,
    productCountRes,
    clientCountRes,
    lowStockRes,
    recentOrdersRes,
    branchesRes
  ] = await Promise.all([
    personPromise,
    productsQuery,
    clientsQuery,
    lowStockQuery,
    recentOrdersQuery,

    // Branches for selector
    rawServiceRoleClient
      .schema('core')
      .from('branch')
      .select('id, name')
      .eq('tenant_id', tenantId)
  ]);

  const firstName = personRes.data?.first_name || 'Usuario';
  const productCount = productCountRes.count || 0;
  const clientCount = clientCountRes.count || 0;
  const lowStockCount = lowStockRes.count || 0;
  const recentOrdersRaw = recentOrdersRes.data || [];
  const branches = branchesRes.data || [];

  // Manual Join for Client Names (Core.Clients -> Shared.Person)
  let recentOrders = recentOrdersRaw; // Default to raw if no clients
  if (recentOrdersRaw.length > 0) {
    const clientIds = [...new Set(recentOrdersRaw.map(o => o.client_id).filter((id: number) => id))];

    if (clientIds.length > 0) {
      const { data: clientsData } = await rawServiceRoleClient
        .schema('core')
        .from('clients')
        .select('id, person_id')
        .in('id', clientIds);

      const personIds = clientsData?.map(c => c.person_id) || [];

      if (personIds.length > 0) {
        const { data: personsData } = await rawServiceRoleClient
          .schema('shared')
          .from('person')
          .select('id, first_name, last_name')
          .in('id', personIds);

        recentOrders = recentOrdersRaw.map(order => {
          const client = clientsData?.find(c => c.id === order.client_id);
          const person = personsData?.find(p => p.id === client?.person_id);
          return {
            ...order,
            client: person ? { first_name: person.first_name, last_name: person.last_name } : null
          };
        });
      }
    }
  }

  // 7. Permission Filter for Quick Actions
  const filteredFeatures = features.filter(feature => {
    return !feature.requiredPermission || permissions.includes(feature.requiredPermission);
  });

  // 8. Fetch Daily Stats via BI Engine (Unified Logic)
  const dailyStats = await biRepository.getSummaryStats(tenantId, {
    period: 'day',
    branchId: branchId
  });

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hola, {firstName} 👋</h1>
          <p className="text-muted-foreground mt-1">Aquí tienes el resumen de tu negocio para hoy.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <DashboardBranchSelector
            branches={branches}
            isBranchLocked={isBranchLocked}
            defaultBranchId={defaultBranchId}
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border h-9">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* KPI SECTION */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Sales Today */}
        <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dailyStats.totalRevenue.toFixed(2)}</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Ingresos
              </p>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                +${dailyStats.totalProfit.toFixed(2)} Netos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Base de clientes activos
            </p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {lowStockCount > 0 ? (
                <span className="text-red-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {lowStockCount} con stock bajo
                </span>
              ) : 'Inventario saludable'}
            </p>
          </CardContent>
        </Card>

        {/* Recent Orders Count (or other metric) */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.orderCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total procesadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: RECENT ORDERS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" /> Ventas Recientes
            </h2>
            <Button variant="ghost" size="sm" asChild className="text-primary">
              <Link href="/protected/sales/orders">Ver todas <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {recentOrders && recentOrders.length > 0 ? (
                <div className="divide-y">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <DollarSign className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {(order.client && order.client.first_name)
                              ? `${order.client.first_name} ${order.client.last_name || ''}`
                              : 'Consumidor Final'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • #{order.order_number || order.id.toString().slice(0, 8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">${order.total?.toFixed(2)}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize flex items-center gap-1 ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {order.status === 'pending' ? <Clock className="w-3 h-3" /> :
                            order.status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                              <AlertCircle className="w-3 h-3" />}
                          {order.status || 'Completado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No hay ventas recientes.</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/protected/sales/orders/create">Crear nueva venta</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: QUICK ACCESS */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Accesos Directos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {filteredFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href} className="group">
                  <div className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:bg-accent/50 hover:shadow-sm transition-all duration-200">
                    <div className={`p-3 rounded-lg ${feature.bg || 'bg-primary/10'} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${feature.color || 'text-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{feature.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
