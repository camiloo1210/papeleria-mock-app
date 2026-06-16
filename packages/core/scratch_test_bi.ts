import { getBiDashboardDataAction } from "./src/features/bi/actions/get-bi-dashboard-data.action";

process.env.NEXT_PUBLIC_USE_MOCK = 'true';

async function test() {
    console.log("Fetching BI dashboard data...");
    const res = await getBiDashboardDataAction({ period: 'year' });
    console.log("Summary Stats:", res.data?.summaryStats);
    console.log("Sales Chart Data sample:", res.data?.salesChartData?.slice(-3));
    console.log("Top Products:", res.data?.topProducts);
    console.log("Restock Alerts count:", res.data?.restockAlerts?.length);
    console.log("Product Success Probability sample:", res.data?.productSuccessProbability?.slice(0, 2));
    console.log("Cohort Data sample:", res.data?.cohortData?.slice(0, 2));
}

test().catch(console.error);
