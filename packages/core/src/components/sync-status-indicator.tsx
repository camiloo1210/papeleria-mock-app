"use client";

// TODO [EXTRACCION]: import a modulo no incluido en este repo -> sync engine offline (EXCLUIDO). Resolver: copiar/stubear o eliminar.
import { useSyncStore } from "@/store/sync.store";
import { Loader2, Cloud, CloudOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


export function SyncStatusIndicator() {
    const { isOnline, isSyncing, pendingItemsCount } = useSyncStore();

    if (!isOnline) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="destructive" className="gap-1.5 h-8 px-3 transition-all duration-300">
                            <CloudOff className="h-4 w-4" />
                            <span className="hidden sm:inline-block">Offline</span>
                            {pendingItemsCount > 0 && (
                                <span className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-xs font-mono">
                                    {pendingItemsCount}
                                </span>
                            )}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>You are offline. {pendingItemsCount} changes pending.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (isSyncing) {
        return (
            <Badge variant="secondary" className="gap-1.5 h-8 px-3 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/25 transition-all duration-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline-block">Syncing...</span>
            </Badge>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1.5 h-8 px-3 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition-all duration-300">
                        <Cloud className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline-block">Saved</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>All changes saved to cloud</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
