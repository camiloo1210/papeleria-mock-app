
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CohortData, RestockAlert, SummaryStats } from '@/features/bi/domain/bi.types';

export const maxDuration = 30; // 30 seconds max

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.warn('[BI] Unauthorized access attempt to insights generation');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { summaryStats, restockAlerts, cohortData } = await req.json() as {
            summaryStats: SummaryStats;
            restockAlerts: RestockAlert[];
            cohortData: CohortData[];
        };

        const simplifiedCohort = cohortData && cohortData.length > 0
            ? {
                latestCohort: cohortData[cohortData.length - 1].cohort,
                latestRetentionMonth1: cohortData[cohortData.length - 1].retention.find(r => r.monthIndex === 1)?.percentage || 0
            }
            : 'Datos insuficientes';

        const criticalStock = restockAlerts.filter(a => a.daysToStockout < 7).length;

        const prompt = `
        Analiza estos KPIs como consultor de negocios:

        Ingresos: $${summaryStats?.totalRevenue?.toFixed(2) || 0}
        Ganancia: $${summaryStats?.totalProfit?.toFixed(2) || 0}
        Ordenes: ${summaryStats?.orderCount || 0}
        Stock critico: ${criticalStock} productos
        Retencion mes 1: ${typeof simplifiedCohort === 'object' ? simplifiedCohort.latestRetentionMonth1.toFixed(1) + '%' : simplifiedCohort}

        Responde en texto plano, sin markdown, 3 parrafos breves:

        1. Estado: evalua salud del negocio por margen ganancia/ingresos
        2. Alertas: destaca stock critico o retencion baja si aplica
        3. Accion: una recomendacion concreta inmediata

        Estilo profesional directo, sin saludos ni emojis.
        `;

        const { text } = await generateText({
            model: google('gemini-flash-latest'),
            prompt: prompt,
        });

        return Response.json({ text });
    } catch (error) {
        console.error('Error generating AI insights:', error);
        return Response.json({ text: 'Lo siento, no pude generar el análisis en este momento. Por favor verifica que la API Key esté configurada.' }, { status: 500 });
    }
}
