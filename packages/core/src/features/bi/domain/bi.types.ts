
export interface RestockAlert {
    productId: number;
    productName: string;
    sku: string;
    currentStock: number;
    avgDailySales: number;
    daysToStockout: number;
    suggestedRestockDate: Date;
    predictionMethod?: 'linear_regression' | 'moving_average';
    confidenceScore?: number;
}

export interface SeasonPerformance {
    seasonId: number;
    seasonName: string;
    totalSales: number;
    productCount: number;
}

export interface ProductPerformance {
    productId: number;
    productName: string;
    totalUnitsSold: number;
    revenue: number;
}

export interface ProductSuccessProbability {
    productId: number;
    productName: string;
    score: number; // 0-100
    salesVelocity: number;
    margin: number;
    turnover: number;
}

export interface SalesDataPoint {
    date: string;
    label: string;
    totalRevenue: number;
    totalProfit: number;
    productBreakdown: { productName: string; revenue: number }[];
}

export interface BiFilters {
    period: 'day' | 'week' | 'month' | 'year';
    branchId?: number;
    productId?: number;
}

export interface SummaryStats {
    totalRevenue: number;
    totalProfit: number;
    orderCount: number;
}

export interface CohortData {
    cohort: string;         // e.g., "Jan 2024"
    initialSize: number;    // Number of new customers in this cohort
    retention: {
        monthIndex: number; // 0, 1, 2...
        percentage: number; // 100, 80, 60...
        count: number;      // 50, 40, 30...
    }[];
}

export interface BiDashboardData {
    restockAlerts: RestockAlert[];
    seasonPerformance: SeasonPerformance[];
    topProducts: ProductPerformance[];
    productSuccessProbability: ProductSuccessProbability[];
    salesChartData: SalesDataPoint[];
    summaryStats: SummaryStats;
    cohortData: CohortData[];
}

export interface BiRepository {
    getRestockAlerts(tenantId: number): Promise<RestockAlert[]>;
    getSeasonPerformance(tenantId: number, branchId?: number): Promise<SeasonPerformance[]>;
    getTopProducts(tenantId: number, branchId?: number): Promise<ProductPerformance[]>;
    getProductSuccessProbability(tenantId: number): Promise<ProductSuccessProbability[]>;
    getSalesChartData(tenantId: number, filters: BiFilters): Promise<SalesDataPoint[]>;
    getSummaryStats(tenantId: number, filters: BiFilters): Promise<SummaryStats>;
    getCohortAnalysis(tenantId: number): Promise<CohortData[]>;
}
