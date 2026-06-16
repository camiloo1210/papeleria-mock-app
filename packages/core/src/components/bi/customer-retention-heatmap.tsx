
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CohortData } from '@/features/bi/domain/bi.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CustomerRetentionHeatmapProps {
    data: CohortData[];
}

export function CustomerRetentionHeatmap({ data }: CustomerRetentionHeatmapProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="border-muted/60 shadow-sm">
                <CardHeader>
                    <CardTitle>Análisis de Cohortes (Retención)</CardTitle>
                    <CardDescription>No hay suficientes datos históricos para mostrar el análisis.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Determine max months to show columns
    const maxMonths = Math.max(...data.map(d => d.retention.length));

    // Helper to get color based on percentage
    const getCellColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-emerald-100 text-emerald-700';
        if (percentage >= 60) return 'bg-green-100 text-green-700';
        if (percentage >= 40) return 'bg-yellow-100 text-yellow-700';
        if (percentage >= 20) return 'bg-orange-100 text-orange-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <Card className="border-muted/60 shadow-sm">
            <CardHeader>
                <CardTitle>Retención de Clientes por Cohorte</CardTitle>
                <CardDescription>Porcentaje de clientes que vuelven a comprar cada mes tras su primera compra.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Cohorte</TableHead>
                            <TableHead>Clientes Nuevos</TableHead>
                            {Array.from({ length: maxMonths }).map((_, i) => (
                                <TableHead key={i} className="text-center w-[60px]">Mes {i}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((cohort) => (
                            <TableRow key={cohort.cohort}>
                                <TableCell className="font-medium">{cohort.cohort}</TableCell>
                                <TableCell>{cohort.initialSize}</TableCell>
                                {Array.from({ length: maxMonths }).map((_, i) => {
                                    const retentionPoint = cohort.retention.find(r => r.monthIndex === i);
                                    if (!retentionPoint) {
                                        return <TableCell key={i} className="bg-muted/5"></TableCell>;
                                    }
                                    return (
                                        <TableCell key={i} className="p-0 text-center">
                                            <div
                                                className={`h-full w-full py-2 px-1 text-xs font-medium ${getCellColor(retentionPoint.percentage)}`}
                                                title={`${retentionPoint.count} clientes (${retentionPoint.percentage.toFixed(1)}%)`}
                                            >
                                                {retentionPoint.percentage.toFixed(0)}%
                                            </div>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
