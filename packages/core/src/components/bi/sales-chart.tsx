"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { SalesDataPoint } from "@/features/bi/domain/bi.types";

interface SalesChartProps {
    data: SalesDataPoint[];
    period: 'day' | 'week' | 'month' | 'year';
}

export function SalesChart({ data, period }: SalesChartProps) {
    const getTitle = () => {
        switch (period) {
            case 'day': return 'Ventas Hoy';
            case 'week': return 'Ventas Semanales';
            case 'month': return 'Ventas Mensuales';
            case 'year': return 'Ventas Anuales';
            default: return 'Ventas';
        }
    };

    const getDescription = () => {
        switch (period) {
            case 'day': return 'Ingresos totales del día de hoy.';
            case 'week': return 'Ingresos totales de los últimos 7 días.';
            case 'month': return 'Ingresos totales de los últimos 30 días.';
            case 'year': return 'Ingresos totales de los últimos 12 meses.';
            default: return 'Ingresos totales.';
        }
    };

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>{getTitle()}</CardTitle>
                <CardDescription>{getDescription()}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="label"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Ventas
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                            ${Number(payload[0].value).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Ganancia
                                                        </span>
                                                        <span className="font-bold text-green-600">
                                                            ${Number(payload[1]?.value || 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar
                                dataKey="totalRevenue"
                                fill="currentColor"
                                radius={[4, 4, 0, 0]}
                                className="fill-primary"
                                name="Ingresos"
                            />
                            <Bar
                                dataKey="totalProfit"
                                fill="#16a34a" // green-600
                                radius={[4, 4, 0, 0]}
                                name="Ganancia"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
