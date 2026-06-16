"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ProductSuccessProbability } from "@/features/bi/domain/bi.types";

interface ProductSuccessChartProps {
    data: ProductSuccessProbability[];
}

export function ProductSuccessChart({ data }: ProductSuccessChartProps) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Probabilidad de Éxito del Producto</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Score Global</TableHead>
                            <TableHead>Velocidad Ventas</TableHead>
                            <TableHead>Margen</TableHead>
                            <TableHead>Rotación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.productId}>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 text-right font-bold">{item.score}%</span>
                                        <Progress
                                            value={item.score}
                                            className="h-2 w-24"
                                        // We can't easily change color based on value with standard shadcn Progress without custom styles or wrapper
                                        // But we can use a class based on score if we want, though standard Progress uses 'primary'
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>{item.salesVelocity}%</TableCell>
                                <TableCell>{item.margin}%</TableCell>
                                <TableCell>{item.turnover}%</TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No hay datos suficientes para calcular la probabilidad.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
