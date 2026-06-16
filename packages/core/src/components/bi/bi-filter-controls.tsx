'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface BiFilterControlsProps {
    branches: { id: number; name: string }[];
    products: { id: number; name: string }[];
    isBranchLocked?: boolean;
    defaultBranchId?: number;
}

export function BiFilterControls({ branches, products, isBranchLocked, defaultBranchId }: BiFilterControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const period = searchParams.get('period') || 'week';
    // If locked, use defaultBranchId, otherwise check URL or default to 'all'
    const branchId = isBranchLocked && defaultBranchId
        ? defaultBranchId.toString()
        : (searchParams.get('branchId') || 'all');

    const productId = searchParams.get('productId') || 'all';

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams();
        params.set('period', 'week');
        // If locked, preserve the branch param if needed, or just rely on the component logic to show it selected.
        // Usually clearing filters means resetting to defaults.
        if (isBranchLocked && defaultBranchId) {
            params.set('branchId', defaultBranchId.toString());
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg shadow-sm border">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Periodo</label>
                <Select value={period} onValueChange={(val) => handleFilterChange('period', val)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar periodo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Última Semana</SelectItem>
                        <SelectItem value="month">Último Mes</SelectItem>
                        <SelectItem value="year">Último Año</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Sucursal</label>
                <Select
                    value={branchId}
                    onValueChange={(val) => handleFilterChange('branchId', val)}
                    disabled={isBranchLocked}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Todas las sucursales" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
                        {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                {branch.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Producto</label>
                <Select value={productId} onValueChange={(val) => handleFilterChange('productId', val)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Todos los productos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los productos</SelectItem>
                        {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-end">
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                    Limpiar Filtros
                </Button>
            </div>
        </div>
    );
}
