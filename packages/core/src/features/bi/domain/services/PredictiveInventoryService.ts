
import * as ss from 'simple-statistics';

export interface PredictionResult {
    productId: number;
    predictedDailySales: number;
    daysUntilStockout: number;
    suggestedRestockDate: Date;
    confidenceScore: number; // 0-1 (based on R-squared or sample size)
    method: 'linear_regression' | 'moving_average';
}

export class PredictiveInventoryService {
    /**
     * Calculates predictive metrics for a list of products based on their sales history.
     * 
     * @param productStock Current stock of the product
     * @param salesHistory Array of daily sales counts (numbers) for the last N days (e.g., 90 days). 
     *                     Ordered closest to furthest? OR chronological?
     *                     Standard: Chronological (index 0 is 90 days ago, index last is yesterday).
     */
    public predict(productId: number, productStock: number, salesHistory: number[]): PredictionResult {
        // 1. Insufficient Data Fallback
        if (salesHistory.length < 14) {
            return this.calculateMovingAverage(productId, productStock, salesHistory);
        }

        // 2. Linear Regression (Trend Analysis)
        // Prepare data for regression: [[dayIndex, salesCount], ...]
        const data = salesHistory.map((sales, index) => [index, sales]);
        const regressionLine = ss.linearRegression(data);
        const regressionLineFunc = ss.linearRegressionLine(regressionLine);
        const rSquared = ss.rSquared(data, regressionLineFunc);

        // Predict sales for "tomorrow" (index = length)
        let predictedDailySales = regressionLineFunc(salesHistory.length);

        // Sanity Check: If trend is negative and predicts < 0, floor it.
        // Also, if trend is wildly high due to noise, cap or dampen it? 
        // For MVP: simple floor at 0.
        if (predictedDailySales < 0) predictedDailySales = 0;

        // If prediction is 0 but we have sales, fallback to average
        // (Regression might be diving down due to recent stockout, etc. - outlier handling needed in future)
        const avg = ss.mean(salesHistory);

        // Hybrid Approach: If R^2 is low (< 0.3), the trend is weak/noisy. Use Weighted Average.
        let method: 'linear_regression' | 'moving_average' = 'linear_regression';
        if (rSquared < 0.3 || predictedDailySales < 0) {
            predictedDailySales = avg;
            method = 'moving_average';
        }

        // Avoid division by zero
        const safeDailySales = predictedDailySales === 0 ? 0.1 : predictedDailySales;

        const daysUntilStockout = productStock / safeDailySales;

        const suggestedRestockDate = new Date();
        suggestedRestockDate.setDate(suggestedRestockDate.getDate() + Math.floor(daysUntilStockout));

        return {
            productId,
            predictedDailySales,
            daysUntilStockout,
            suggestedRestockDate,
            confidenceScore: method === 'linear_regression' ? rSquared : 0.5, // 0.5 arbitrary for avg
            method
        };
    }

    private calculateMovingAverage(productId: number, stock: number, history: number[]): PredictionResult {
        const avg = history.length > 0 ? ss.mean(history) : 0;
        const safeAvg = avg === 0 ? 0.1 : avg;
        const days = stock / safeAvg;

        const date = new Date();
        date.setDate(date.getDate() + Math.floor(days));

        return {
            productId,
            predictedDailySales: avg,
            daysUntilStockout: days,
            suggestedRestockDate: date,
            confidenceScore: 0.1, // Low confidence due to low data
            method: 'moving_average'
        };
    }
}
