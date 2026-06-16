'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface DashboardBranchSelectorProps {
    branches: { id: number; name: string }[];
    isBranchLocked?: boolean;
    defaultBranchId?: number;
}

export function DashboardBranchSelector({ branches, isBranchLocked, defaultBranchId }: DashboardBranchSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // If locked, use defaultBranchId, otherwise check URL or default to 'all'
    const branchId = isBranchLocked && defaultBranchId
        ? defaultBranchId.toString()
        : (searchParams.get('branchId') || 'all');

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('branchId');
        } else {
            params.set('branchId', value);
        }
        router.push(`?${params.toString()}`);
    };

    if (branches.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Select
                value={branchId}
                onValueChange={handleFilterChange}
                disabled={isBranchLocked}
            >
                <SelectTrigger className="w-[200px] h-9">
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
    );
}
