
import { BiRepository, BiDashboardData, BiFilters } from '../domain/bi.types';

export class GetBiDashboardDataUseCase {
    constructor(private biRepository: BiRepository) { }

    async execute(tenantId: number, filters: BiFilters): Promise<BiDashboardData> {
        const [restockAlerts, seasonPerformance, topProducts, productSuccessProbability, salesChartData, summaryStats, cohortData] = await Promise.all([
            this.biRepository.getRestockAlerts(tenantId),
            this.biRepository.getSeasonPerformance(tenantId, filters.branchId),
            this.biRepository.getTopProducts(tenantId, filters.branchId),
            this.biRepository.getProductSuccessProbability(tenantId),
            this.biRepository.getSalesChartData(tenantId, filters),
            this.biRepository.getSummaryStats(tenantId, filters), // Use full filters
            this.biRepository.getCohortAnalysis(tenantId)
        ]);

        return {
            restockAlerts,
            seasonPerformance,
            topProducts,
            productSuccessProbability,
            salesChartData,
            summaryStats,
            cohortData
        };
    }
}
