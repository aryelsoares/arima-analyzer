// Forecast

import { DATA } from "./data";
import { Stats, Tester, AutoARIMA } from "./statistics";

const MAX_P = 8;
const MAX_D = 4;
const MAX_Q = 8;

const MAX_SP = Math.floor(MAX_P / 2);
const MAX_SD = Math.floor(MAX_D / 2);
const MAX_SQ = Math.floor(MAX_Q / 2);

function estimateComponent(
    lags: number[],
    lower: number,
    upper: number,
    maxComponent: number,
    period?: number
): number {
    period = period || 1;

    let idx = period === 1 ? 0 : 1;
    let bestK = 0;

    for (let k = idx; k <= maxComponent; k += period) {
        if (k >= lags.length) break;

        if (lags[k] < lower || lags[k] > upper) {
            bestK++;
        } else {
            break;
        }
    }

    return bestK;
}

/* Forecast */
export function forecast(Y: number[]) {
    const stats = new Stats(Y);

    /* Descriptive Statistics */

    DATA.descStats = {
        n: Y.length, mean: stats.mean(), median: stats.median(), mode: stats.mode(),
        std: stats.std(), min: Math.min(...Y), max: Math.max(...Y)
    };

    /* Distribution */

    DATA.distStats = {
        normal: stats.distNorm(), skew: stats.skew(), kurtosis: stats.kurtosis()
    };

    /* Seasonality */

    const seasonality = stats.seasonalityScore(2, 30, DATA.config.significance);

    DATA.seasonalStats = {
        score: seasonality.score, period: seasonality.period,
        acfStrength: seasonality.components.acfStrength,
        cycleScore: seasonality.components.cycleScore,
        peakConsistency: seasonality.components.peakConsistency
    };

    /* Rolling Data */

    DATA.rollingStats = {
        mean: stats.rollingMean(seasonality.period), std: stats.rollingStd(seasonality.period)
    };

    /* Stationarity */

    let stationarySeries = Y;
    let currentStationaryScore = 0;
    for (let d = 0; d < MAX_D; d++) {
        let stationary = new Stats(stationarySeries);
        let result = stationary.stationaryScore(seasonality.period, DATA.config.lagAmount);
    
        if (d === 0) {
            DATA.stationaryStats = {
                score: result.score,
                meanScore: result.components.meanScore,
                varScore: result.components.varScore,
                trendScore: result.components.trendScore
            };
        }

        if (result.score >= DATA.config.stationaryScore || result.score < currentStationaryScore) {
            DATA.stationaryData = stationarySeries;
            break;
        }

        stationarySeries = stationary.diff();
        currentStationaryScore = result.score + 10;
        DATA.arimaParams.d++;
    }

    /* Autocorrelation */

    const acfTest = new Stats(stationarySeries).acf(DATA.config.lagAmount, DATA.config.significance);
    const pacfTest = new Stats(stationarySeries).pacf(DATA.config.lagAmount, DATA.config.significance);

    // ACF
    DATA.acfStats = {
        lags: acfTest.lags,
        lower: acfTest.lower,
        upper: acfTest.upper
    };

    // PACF
    DATA.pacfStats = {
        lags: pacfTest.lags,
        lower: pacfTest.lower,
        upper: pacfTest.upper
    };

    DATA.arimaParams.p = estimateComponent(pacfTest.lags, pacfTest.lower, pacfTest.upper, MAX_P);
    DATA.arimaParams.q = estimateComponent(acfTest.lags, acfTest.lower, acfTest.upper, MAX_Q);

    /* Seasonality Detection */

    if (DATA.seasonalStats.score >= DATA.config.seasonalScore) {
        let seasonalStationarySeries = Y;
        let currentSeasonalScore = 0;

        for (let D = 0; D < MAX_SD; D++) {
            const stationary = new Stats(seasonalStationarySeries);
            const result = stats.stationaryScore(seasonality.period, DATA.config.lagAmount);

            if (D === 0) {
                DATA.seasonalStationaryStats.score = result.score,
                DATA.seasonalStationaryStats.meanScore = result.components.meanScore,
                DATA.seasonalStationaryStats.varScore = result.components.varScore,
                DATA.seasonalStationaryStats.trendScore = result.components.trendScore
            }

            if (result.score >= DATA.config.seasonalScore || result.score < currentSeasonalScore) {
                DATA.seasonalStationaryData = seasonalStationarySeries;
                break;
            }

            seasonalStationarySeries = stationary.diff(DATA.seasonalStats.period);
            currentSeasonalScore = result.score;
            DATA.arimaParams.D++;
        }

        const sacfTest = new Stats(seasonalStationarySeries).acf(Math.min(Y.length, seasonality.period * MAX_SP + 1), DATA.config.significance);
        const spacfTest = new Stats(seasonalStationarySeries).pacf(Math.min(Y.length, seasonality.period * MAX_SQ + 1), DATA.config.significance);

        // SACF
        DATA.sacfStats = {
            lags: sacfTest.lags,
            lower: sacfTest.lower,
            upper: sacfTest.upper
        };

        // SPACF
        DATA.spacfStats = {
            lags: spacfTest.lags,
            lower: spacfTest.lower,
            upper: spacfTest.upper
        }

        DATA.arimaParams.P = estimateComponent(spacfTest.lags, spacfTest.lower, spacfTest.upper, MAX_SP, seasonality.period);
        DATA.arimaParams.Q = estimateComponent(sacfTest.lags, spacfTest.lower, spacfTest.upper, MAX_SQ, seasonality.period);
    }

    /* Prediction */

    const arima = new AutoARIMA(Y, DATA.config.splitSize);

    DATA.splitData.train = arima.train;
    DATA.splitData.test = arima.test;

    const model = arima.fit({
        maxP: DATA.arimaParams.p, maxD: DATA.arimaParams.d, maxQ: DATA.arimaParams.q,
        maxSP: DATA.arimaParams.P, maxSD: DATA.arimaParams.D, maxSQ: DATA.arimaParams.Q,
        period: DATA.seasonalStats.period, lagAmount: DATA.config.lagAmount, significance: DATA.config.significance
    });

    DATA.splitData = {
        train: arima.train, test: arima.test, rsd: arima.residuals
    };

    // All model results
    DATA.results = arima.results;

    const param = model.params;

    DATA.arimaParams = {
        p: param.p, d: param.d, q: param.q,
        P: param.P, D: param.D, Q: param.Q, s: param.s
    };

    const metric = model.metrics;

    DATA.metricStats = {
        mae: metric.mae,
        rmse: metric.rmse,
        r2: metric.r2,
        u2: metric.u2,
        mase: metric.mase,
    };

    const horizon = DATA.splitData.test.length;
    const [pred, interval] = model.predict(horizon);

    DATA.predValues = { data: pred, interval: interval };

    /* Residual Test */

    const tester = new Tester(DATA.splitData.rsd);
    const normTest = tester.jarqueBeraTest(DATA.config.significance);

    const QQData = stats.QQPlotNormal();
    DATA.rsdDist = {
        Q_theoretical: QQData.Q_theoretical,
        Q_empirical: QQData.Q_empirical,
        jb_score: normTest.jb,
        isNormal: normTest.isNormal
    };

    const corrData = new Stats(DATA.splitData.rsd).acf(DATA.config.lagAmount, DATA.config.significance);
    const corrSCore = tester.residualCorrScore(corrData);

    DATA.rsdCorr = {
        correlation: corrData,
        score: corrSCore.score,
        reject: corrSCore.reject
    }
}