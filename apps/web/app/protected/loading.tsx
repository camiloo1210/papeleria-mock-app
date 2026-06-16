import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-8 pb-8">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" /> {/* Welcome */}
                    <Skeleton className="h-5 w-96" /> {/* Subtitle */}
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-32" /> {/* Branch Selector */}
                    <Skeleton className="h-9 w-40" /> {/* Date */}
                </div>
            </div>

            {/* KPI SECTION */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-l-4 border-l-muted shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* RECENT ACTIVITY & QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: RECENT ORDERS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-8 w-24" />
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 flex flex-col items-end">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: QUICK ACCESS */}
                <div className="space-y-6">
                    <Skeleton className="h-7 w-40" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl border bg-card">
                                <Skeleton className="h-11 w-11 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
