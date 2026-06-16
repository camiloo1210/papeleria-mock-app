'use client';

import { useState, useEffect } from "react";
import { getBiDashboardDataAction, BiDashboardResponse } from "@/features/bi/actions/get-bi-dashboard-data.action";
import { BiFilters } from "@/features/bi/domain/bi.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProductSuccessChart } from '@/components/bi/product-success-chart';
import { CustomerRetentionHeatmap } from '@/components/bi/customer-retention-heatmap';
import { SalesChart } from '@/components/bi/sales-chart';
import { BiFilterControls } from '@/components/bi/bi-filter-controls';
import { AiInsightsCard } from '@/components/bi/ai-insights-card';
import { BarChart3, TrendingUp, AlertTriangle, Package, Calendar, Loader2, Sparkles } from 'lucide-react';
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

export function BiDashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Initial State from URL
    const initialPeriod = (searchParams.get('period') as 'week' | 'month' | 'year') || 'week';
    const initialBranchId = searchParams.get('branchId') ? Number(searchParams.get('branchId')) : undefined;
    const initialProductId = searchParams.get('productId') ? Number(searchParams.get('productId')) : undefined;

    const [filters, setFilters] = useState<BiFilters>({
        period: initialPeriod,
        branchId: initialBranchId,
        productId: initialProductId
    });

    const [state, setState] = useState<BiDashboardResponse>({
        data: null,
        branches: [],
        products: []
    });

    const [loading, setLoading] = useState(true);
    const [biTab, setBiTab] = useState<'overview' | 'ranking'>('overview');

    const fetchData = async () => {
        setLoading(true);
        try {
            const timeoutPromise = new Promise<BiDashboardResponse>((_, reject) =>
                setTimeout(() => reject(new Error("Tiempo de espera agotado")), 45000)
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await Promise.race([getBiDashboardDataAction(filters), timeoutPromise]) as BiDashboardResponse;

            if (result.error) {
                toast.error(result.error);
            } else {
                setState(result);
            }
        } catch (error) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any)?.message || "Error cargando dashboard";
            toast.error(msg === "Tiempo de espera agotado" ? "El servidor tardó demasiado en responder" : msg);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.period, filters.branchId, filters.productId]);

    // Update URL when filters change (shallow)
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.period) params.set('period', filters.period);
        if (filters.branchId) params.set('branchId', filters.branchId.toString());
        if (filters.productId) params.set('productId', filters.productId.toString());

        router.push(`?${params.toString()}`, { scroll: false });
    }, [filters, router]);

    // Handle Filter Changes
    // Note: BiFilterControls likely expects to read from URL or props?
    // Let's check BiFilterControls implementation if I can.
    // Assuming BiFilterControls uses URL, but the user wants "Instant Update".
    // If BiFilterControls uses <Link> or router.push, it will trigger this component to re-render via searchParams?
    // Wait, if BiFilterControls PUSHES via Router, searchParams change.
    // If searchParams change, we need to update `filters` state or just depend on searchParams.

    // To match typical Next.js patterns, we should rely on URL as Source of Truth.
    // BUT Client Component `useEffect` on `searchParams` works too.

    // Let's verify if `BiFilterControls` takes callbacks or just navigates.

    // Logic: If user uses BiFilterControls that navigates, `searchParams` updates -> component re-renders -> we update filters?
    // Let's use `useEffect` on `searchParams` to sync state if external navigation happens.
    useEffect(() => {
        const p = (searchParams.get('period') as 'week' | 'month' | 'year') || 'week';
        const b = searchParams.get('branchId') ? Number(searchParams.get('branchId')) : undefined;
        const pr = searchParams.get('productId') ? Number(searchParams.get('productId')) : undefined;

        // Only update if different to avoid loop
        if (p !== filters.period || b !== filters.branchId || pr !== filters.productId) {
            setFilters({ period: p, branchId: b, productId: pr });
        }
    }, [searchParams, filters]);


    if (loading && !state.data) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Analizando datos...</p>
            </div>
        );
    }

    const { data, branches, products, userFirstName, isBranchLocked, defaultBranchId } = state;

    if (!data) return <div className="p-8 text-center text-red-500">Error: No se pudieron cargar los datos.</div>;

    const { summaryStats, restockAlerts, topProducts, productSuccessProbability, cohortData, seasonPerformance } = data;

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full fade-in animate-in duration-500">
            {/* Header Section */}
            <div className="group relative w-full rounded-xl overflow-hidden bg-card border shadow-sm transition-all hover:shadow-md">
                <div className="h-32 w-full bg-primary/20 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                </div>

                <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 items-start -mt-12 relative z-10">
                    <div className="h-24 w-24 rounded-2xl bg-background p-1.5 shadow-lg border ring-2 ring-background">
                        <div className="h-full w-full rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <BarChart3 className="h-10 w-10" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-1 pt-14 md:pt-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Hola, {userFirstName} 👋</h1>
                                <p className="text-muted-foreground mt-1 text-sm font-medium">
                                    Analiza el rendimiento de tu negocio, ventas y stock en tiempo real.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BiFilterControls
                branches={branches || []}
                products={products || []}
                isBranchLocked={!!isBranchLocked}
                defaultBranchId={defaultBranchId}
            />

            {/* Tabs Selector */}
            <div className="flex border-b border-gray-200/80 gap-6">
                <button
                    onClick={() => setBiTab('overview')}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                        biTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <BarChart3 className="w-4.5 h-4.5" />
                    Métricas Operativas
                </button>
                <button
                    onClick={() => setBiTab('ranking')}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                        biTab === 'ranking' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <TrendingUp className="w-4.5 h-4.5" />
                    Ranking de SKUs (Más Vendidos)
                </button>
            </div>

            {biTab === 'overview' ? (
                <>
                    {/* AI Insights Section */}
                    <div className="w-full">
                        <AiInsightsCard data={data} />
                    </div>

                    {/* Summary Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-l-4 border-l-primary shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {filters.period === 'month' ? 'Ventas del Mes' :
                                        filters.period === 'year' ? 'Ventas del Año' :
                                            'Ventas de la Semana'}
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${summaryStats.totalRevenue.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {summaryStats.orderCount} órdenes procesadas
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-primary/70 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    ${(summaryStats.totalProfit || 0).toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Margen: {summaryStats.totalRevenue > 0 ? ((summaryStats.totalProfit / summaryStats.totalRevenue) * 100).toFixed(1) : 0}%
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-muted shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rentabilidad</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {summaryStats.totalRevenue > 0 ? ((summaryStats.totalProfit / summaryStats.totalRevenue) * 100).toFixed(1) : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Retorno sobre ventas
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Sales Chart */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <SalesChart data={data.salesChartData} period={filters.period || 'week'} />
                        </div>

                        {/* Season Performance */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-muted/60 shadow-sm">
                            <CardHeader className="bg-muted/5 border-b pb-4">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Rendimiento por Temporada
                                </CardTitle>
                                <CardDescription>Ventas totales agrupadas por temporada.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {seasonPerformance.map(season =>
                                        <div key={season.seasonId} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{season.seasonName}</span>
                                                <span className="text-muted-foreground font-mono">${season.totalSales.toFixed(2)}</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
                                                    style={{ width: `${Math.min((season.totalSales / (seasonPerformance[0]?.totalSales || 1)) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">{season.productCount} productos asociados</p>
                                        </div>
                                    )}
                                    {seasonPerformance.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                            <Calendar className="h-8 w-8 mb-2 opacity-20" />
                                            <p className="text-sm">No hay datos de temporadas.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Restock Alerts */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-muted/60 shadow-sm">
                            <CardHeader className="bg-muted/5 border-b pb-4">
                                <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    Alertas de Restock
                                </CardTitle>
                                <CardDescription>Productos que se agotarán en menos de 14 días.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="pl-6">Producto</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Días</TableHead>
                                            <TableHead className="text-right pr-6">Fecha Sugerida</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {restockAlerts.map(alert => (
                                            <TableRow key={alert.productId} className="hover:bg-accent/50">
                                                <TableCell className="pl-6 font-medium">{alert.productName}</TableCell>
                                                <TableCell>{alert.currentStock}</TableCell>
                                                <TableCell>
                                                    <Badge variant={alert.daysToStockout < 7 ? "destructive" : "secondary"} className="rounded-sm">
                                                        {Math.floor(alert.daysToStockout)} días
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 text-muted-foreground">
                                                    {alert.suggestedRestockDate ? new Date(alert.suggestedRestockDate).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {restockAlerts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Package className="h-6 w-6 opacity-20" />
                                                        <p>No hay alertas de restock.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Top Products */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-muted/60 shadow-sm">
                            <CardHeader className="bg-muted/5 border-b pb-4">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Top Productos
                                </CardTitle>
                                <CardDescription>Los 10 productos con mayores ingresos.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="pl-6">Producto</TableHead>
                                            <TableHead className="text-right">Unidades</TableHead>
                                            <TableHead className="text-right pr-6">Ingresos</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topProducts.map(product => (
                                            <TableRow key={product.productId} className="hover:bg-accent/50">
                                                <TableCell className="pl-6 font-medium">{product.productName}</TableCell>
                                                <TableCell className="text-right">{product.totalUnitsSold}</TableCell>
                                                <TableCell className="text-right pr-6 font-mono text-primary font-medium">
                                                    ${product.revenue.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {topProducts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <TrendingUp className="h-6 w-6 opacity-20" />
                                                        <p>No hay datos de ventas.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Product Success Probability */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-4">
                            <ProductSuccessChart data={productSuccessProbability} />
                        </div>

                        {/* Customer Retention Cohorts */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-4">
                            <CustomerRetentionHeatmap data={cohortData} />
                        </div>
                    </div>
                </>
            ) : (
                /* Tab: Ranking de SKUs */
                <Card className="border-gray-200/80 shadow-md">
                    <CardHeader className="bg-gray-50/50 border-b pb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    Ranking de Ventas por SKU
                                </CardTitle>
                                <CardDescription>
                                    Listado completo de productos ordenados por volumen de ingresos y contribución total.
                                </CardDescription>
                            </div>
                            <div className="bg-indigo-50 border border-indigo-100 text-indigo-950 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                                Total Ventas: <span className="text-indigo-600 font-mono">${summaryStats.totalRevenue.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-100/30 hover:bg-gray-100/30">
                                    <TableHead className="w-[80px] font-bold text-center pl-6">Posición</TableHead>
                                    <TableHead className="font-bold">Producto</TableHead>
                                    <TableHead className="text-right font-bold">Unidades Vendidas</TableHead>
                                    <TableHead className="text-right font-bold">Ingresos Totales (USD)</TableHead>
                                    <TableHead className="text-right font-bold text-indigo-700">Porcentaje de Venta</TableHead>
                                    <TableHead className="pr-6 font-bold w-[220px]">Distribución de Ingresos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProducts.map((p, idx) => {
                                    const percentage = summaryStats.totalRevenue > 0 ? (p.revenue / summaryStats.totalRevenue) * 100 : 0;
                                    return (
                                        <TableRow key={p.productId} className="hover:bg-gray-50/30 transition-colors">
                                            <TableCell className="text-center font-bold pl-6 py-4">
                                                {idx === 0 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs">
                                                        🥇
                                                    </span>
                                                ) : idx === 1 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs">
                                                        🥈
                                                    </span>
                                                ) : idx === 2 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                                                        🥉
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 font-mono text-sm">{idx + 1}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900">
                                                <div>
                                                    <div className="font-bold">{p.productName}</div>
                                                    <div className="text-xs text-gray-400 font-mono">ID: {p.productId}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-gray-800 font-mono">
                                                {p.totalUnitsSold}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-gray-950 font-mono">
                                                ${p.revenue.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-indigo-600 font-mono">
                                                {percentage.toFixed(1)}%
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {topProducts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            No hay registros de ventas disponibles en este período.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
