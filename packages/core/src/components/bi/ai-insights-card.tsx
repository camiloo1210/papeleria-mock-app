'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import { BiDashboardData } from '@/features/bi/domain/bi.types';

interface AiInsightsCardProps {
    data: BiDashboardData;
}

export function AiInsightsCard({ data }: AiInsightsCardProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/bi/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summaryStats: data.summaryStats,
                    restockAlerts: data.restockAlerts,
                    cohortData: data.cohortData
                }),
            });
            const result = await response.json();
            setInsight(result.text);
        } catch (error) {
            console.error(error);
            setInsight('Error al conectar con el asistente inteligente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Sparkles className="h-5 w-5" />
                    Insights Inteligentes (Beta)
                </CardTitle>
                <CardDescription>
                    Obtén un análisis instantáneo de tu negocio impulsado por Google Gemini AI.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!insight && !loading && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Bot className="h-10 w-10 text-purple-300 mb-3" />
                        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                            Nuestra IA analizará tus ventas, márgenes y retención para darte recomendaciones estratégicas.
                        </p>
                        <Button
                            onClick={handleGenerate}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generar Reporte con IA
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <p className="text-sm text-purple-600 font-medium animate-pulse">
                            Analizando tendencias de mercado y tus datos...
                        </p>
                    </div>
                )}

                {insight && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            {/* Simple rendering for markdown-like text structure without full MD parser for speed/lightweight */}
                            {insight.split('\n').map((line, i) => {
                                if (line.startsWith('**')) return <strong key={i} className="block mt-2 text-purple-900 dark:text-purple-100">{line.replace(/\*\*/g, '')}</strong>;
                                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-muted-foreground">{line.replace('- ', '')}</li>;
                                return <p key={i} className="text-muted-foreground">{line}</p>;
                            })}
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setInsight(null)} className="text-xs text-muted-foreground">
                                Cerrar análisis
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
