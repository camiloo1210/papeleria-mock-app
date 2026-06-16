"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function MarketplaceSearch() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q")?.toString() || "";
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // 1. Passive Sync: Update local state when URL changes (e.g. navigation or other search bar)
    useEffect(() => {
        const urlQuery = searchParams.get("q")?.toString() || "";
        if (urlQuery !== searchTerm) {
            setSearchTerm(urlQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // 2. Active Sync: Update URL when local state changes (debounced)
    useEffect(() => {
        const currentQuery = searchParams.get("q")?.toString() || "";

        if (debouncedSearchTerm !== currentQuery) {
            const params = new URLSearchParams(searchParams);
            if (debouncedSearchTerm) {
                params.set("q", debouncedSearchTerm);
            } else {
                params.delete("q");
            }
            router.replace(`/marketplace?${params.toString()}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm]);

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
                type="text"
                value={searchTerm}
                placeholder="¿Qué quieres pedir hoy?"
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 w-full bg-gray-100 border-none rounded-2xl focus-visible:ring-indigo-500 focus-visible:bg-white transition-all shadow-sm"
            />
        </div>
    );
}
