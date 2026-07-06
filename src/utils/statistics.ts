// Statistics
import ARIMA from 'arima';
import { ValidationError } from "@/errors/validation";

export class Stats {
    private data: number[];
    private size: number;

    constructor(data: number[]) {
        // Empty data
        if (data.length === 0) {
            throw new ValidationError("Empty Data", "Data length can't be 0.");
        }

        // NaN values
        if (data.some(Number.isNaN)) {
            throw new ValidationError("Missing Data","NaN values detected");
        }

        this.data = data;
        this.size = data.length
    }

    // Sum
    sum(): number {
        return this.data.reduce((a, b) => a + b, 0);
    }

    // Mean
    mean(): number {
        return this.sum() / this.size;
    }

    // Mode
    mode(): number | null {
        const freq = new Map<number, number>();

        for (const value of this.data) {
            freq.set(value, (freq.get(value) ?? 0) + 1);
        }

        let mode: number | null = null;
        let maxCount = 0;

        for (const [value, count] of freq) {
            if (count > maxCount) {
                maxCount = count;
                mode = value;
            }
        }

        return mode;
    }

    // Quantiles
    quantile(p: number): number {
        if (p < 0 || p > 1) {
            throw new ValidationError("Invalid Quantile Interval", "p must be in [0,1].");
        }

        const sorted = [...this.data].sort((a, b) => a - b);
        const n = sorted.length;

        if (n === 0) return NaN;
        if (n === 1) return sorted[0];

        // R-7 method
        const h = 1 + (n - 1) * p;
        const k = Math.floor(h);
        const gamma = h - k;

        // Convert to 0-based index
        const xk = sorted[k - 1];
        const xk1 = sorted[Math.min(k, n - 1)];

        return (1 - gamma) * xk + gamma * xk1;
    }

    // Median
    median(): number {
        return this.quantile(0.5);
    }

    // Q1
    q1(): number {
        return this.quantile(0.25);
    }

    // Q3
    q3(): number {
        return this.quantile(0.75);
    }

    // Mad
    mad(): number {
        const med = this.median();

        const deviations = this.data.map(
            v => Math.abs(v - med)
        );

        const devStats = new Stats(deviations);
        return devStats.median();
    }

    // Std
    std(): number {
        const m = this.mean();
        const sub = this.data.reduce((acc, value) => {
            return acc + (value - m) ** 2;
        }, 0);

        return Math.sqrt(sub / (this.size - 1));
    }

    // Norm Dist
    distNorm(): number[] {
        const mu = this.mean();
        const sigma = this.std();

        return this.data.map(v => {
            const frac = 1 / (sigma * Math.sqrt(2 * Math.PI));
            const exp = Math.exp(-0.5 * ((v - mu) / sigma) ** 2);
            return frac * exp;
        });
    }

    // skew
    skew(): number {
        const m = this.mean();
        const numerator = 1 / this.size * this.data.reduce((acc, value) => {
            return acc + (value - m) ** 3;
        }, 0);
        const denominator = 1 / this.size * this.data.reduce((acc, value) => {
            return acc + (value - m) ** 2;
        }, 0) ** 1.5;

        return numerator / denominator;
    }

    // kurtosis
    kurtosis(): number {
        const m = this.mean();
        const numerator = 1 / this.size * this.data.reduce((acc, value) => {
            return acc + (value - m) ** 4;
        }, 0);
        const denominator = 1 / this.size * this.data.reduce((acc, value) => {
            return acc + (value - m) ** 2;
        }, 0) ** 2;

        return numerator / denominator;
    }

    // Jarque-Bera
    jarqueBera(): number {
        return this.size / 6 * (this.skew() ** 2 + ((this.kurtosis() - 3) ** 2) / 4);
    }

    // Quantiles
    QQPlotNormal(): {Q_theoretical: number[], Q_empirical: number[]} {
        function normalInverseCDF(p: number): number {
            if (p <= 0 || p >= 1) {
                throw new ValidationError("Invalid Quantile Interval", "p must be in (0,1).");
            }

            // Acklam coef
            const a = [
                -3.969683028665376e+01,
                2.209460984245205e+02,
                -2.759285104469687e+02,
                1.383577518672690e+02,
                -3.066479806614716e+01,
                2.506628277459239e+00
            ];

            const b = [
                -5.447609879822406e+01,
                1.615858368580409e+02,
                -1.556989798598866e+02,
                6.680131188771972e+01,
                -1.328068155288572e+01
            ];

            const c = [
                -7.784894002430293e-03,
                -3.223964580411365e-01,
                -2.400758277161838e+00,
                -2.549732539343734e+00,
                4.374664141464968e+00,
                2.938163982698783e+00
            ];

            const d = [
                7.784695709041462e-03,
                3.224671290700398e-01,
                2.445134137142996e+00,
                3.754408661907416e+00
            ];

            const plow = 0.02425;
            const phigh = 1 - plow;

            let q, r;

            // Left tail
            if (p < plow) {
                q = Math.sqrt(-2 * Math.log(p));
                return (
                    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
                );
            }

            // Right tail
            if (p > phigh) {
                q = Math.sqrt(-2 * Math.log(1 - p));
                return (
                    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
                );
            }

            // Central region
            q = p - 0.5;
            r = q * q;
            return (
                (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
                (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
            );

        }

        const Q_empirical = [...this.data].sort((a, b) => a - b);
        const n = this.size;

        const mi = this.mean();
        const sigma = this.std();

        const Q_theoretical: number[] = [];
        for (let i = 0; i < n; i++) {
            const p = (i + 0.5) / n;
            const z = normalInverseCDF(p);
            const adj = mi + sigma * z;
            Q_theoretical.push(adj)
        }

        return ({Q_theoretical, Q_empirical});
    }

    // Correlation
    correlation(x: number[], y: number[]): number {
        const n = Math.min(x.length, y.length);
        if (n === 0) return 0;

        let sumX = 0, sumY = 0;
        let sumXY = 0;
        let sumX2 = 0, sumY2 = 0;

        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
            sumY2 += y[i] * y[i];
        }

        const num = n * sumXY - sumX * sumY;
        const den = Math.sqrt(
            (n * sumX2 - sumX * sumX) *
            (n * sumY2 - sumY * sumY)
        );

        return den !== 0 ? num / den : 0;
    }

    // ACF
    acf(maxLag: number, significance?: number): {
        lags: number[],
        lower: number,
        upper: number
    } {
        const m = this.mean();
        const lagList = [];

        for (let lag = 0; lag < maxLag; lag++) {
            let numerator = 0;
            let denominator = this.data.reduce(
                (acc, x) => acc + (x - m) ** 2,
                0
            );

            for (let i = 0; i < this.size; i++) {
                if (i + lag < this.size) {
                    numerator += (this.data[i] - m) * (this.data[i + lag] - m);
                }
            }

            const result = numerator / denominator;
            lagList.push(result);
        }

        // Confidence Interval
        let z = 1.96;
        if (significance === 0.01) z = 2.576;
        else if (significance === 0.10) z = 1.645;

        const margin = z / Math.sqrt(this.size);

        return {
            lags: lagList,
            lower: -margin,
            upper: margin
        };
    }

    // PACF
    pacf(maxLag: number, significance?: number): {
        lags: number[],
        lower: number,
        upper: number
    } {
        const acf = this.acf(maxLag + 1).lags;

        const pacf: number[] = [];
        const phi: number[][] = [];
        const sigma: number[] = [];

        sigma[0] = 1;

        for (let k = 1; k <= maxLag; k++) {
            phi[k] = [];

            let sum = 0;
            for (let j = 1; j < k; j++) {
                sum += phi[k - 1][j] * acf[k - j];
            }

            const phiKK = (acf[k] - sum) / sigma[k - 1];
            phi[k][k] = phiKK;

            for (let j = 1; j < k; j++) {
                phi[k][j] = phi[k - 1][j] - phiKK * phi[k - 1][k - j];
            }

            sigma[k] = sigma[k - 1] * (1 - phiKK * phiKK);
            pacf.push(phiKK);
        }

        // Confidence Interval
        let z = 1.96;
        if (significance === 0.01) z = 2.576;
        else if (significance === 0.10) z = 1.645;

        const margin = z / Math.sqrt(this.size);

        return {
            lags: pacf,
            lower: -margin,
            upper: margin
        };
    }

    // Difference
    diff(period: number = 1) {
        const result = [];
        for (let i = period; i < this.size; i++) {
            result.push(this.data[i] - this.data[i - period]);
        }
        return result;
    }

    // Rolling Mean
    rollingMean(window: number): number[] {
        const result: number[] = [];

        for (let i = 0; i <= this.data.length - window; i++) {
            const slice = this.data.slice(i, i + window);
            const stats = new Stats(slice);
            result.push(stats.mean());
        }

        return result;
    }

    // Rolling Std
    rollingStd(window: number): number[] {
        const result: number[] = [];

        for (let i = 0; i <= this.data.length - window; i++) {
            const slice = this.data.slice(i, i + window);
            const stats = new Stats(slice);
            result.push(stats.std());
        }

        return result;
    }

    // Stationary Score
    stationaryScore(window: number = 10, maxLag: number = 20): {
        score: number,
        components: {meanScore: number, varScore: number, trendScore: number}
    } {
        const n = this.size;
        if (n < 3 * window) {
            return {
                score: 1,
                components: {meanScore: 0, varScore: 0, trendScore: 0}
            };
        }

        const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

        // Mean
        const rollingMean = this.rollingMean(window);
        const meanStats = new Stats(rollingMean)

        const meanScore = clamp01(
            1 - meanStats.std() / (this.std() + 1e-8)
        );

        // Variance
        const rollingStd = this.rollingStd(window);
        const stdStats = new Stats(rollingStd);

        const globalStd = this.std();

        const varScore = clamp01(
            1 - stdStats.std() / (globalStd + 1e-08)
        );

        // Time Trend
        const time = Array.from(
            { length: rollingMean.length },
            (_, i) => i
        );

        const trendCorr = Math.abs(meanStats.correlation(rollingMean, time));
        const trendScore = clamp01(1 - trendCorr);

        // Final score
        const score = (meanScore + varScore + trendScore) / 3;
        
        return {
            score,
            components: {
                meanScore,
                varScore,
                trendScore
            }
        };
    }

    // Detrend
    detrend(): number[] {
        const n = this.size;

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        for (let i = 0; i < n; i++) {
            const x = i;
            const y = this.data[i];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        const denom = n * sumXX - sumX * sumX;
        if (Math.abs(denom) < 1e-12) return [...this.data];

        const slope = (n * sumXY - sumX * sumY) / denom;
        const intercept = (sumY - slope * sumX) / n;

        const detrended = new Array<number>(n);
        for (let i = 0; i < n; i++) {
            detrended[i] = this.data[i] - (slope * i + intercept);
        }

        return detrended;
    }

    // Seasonality Score
    seasonalityScore(minPeriod: number = 2, maxPeriod: number = 60): {
        score: number,
        period: number,
        components: {acfStrength: number, peakConsistency: number, cycleScore: number}
    } {
        // Peak function
        function getPeakConsistency(peaks: number[], period: number): number {
            let peakConsistency = 0;

            if (peaks.length >= 2 && period > 0) {
                const errors: number[] = [];

                for (const lag of peaks) {
                    const nearestMultiple = Math.round(lag / period) * period;
                    const error = Math.abs(lag - nearestMultiple) / period;
                    errors.push(error);
                }

                const errorStats = new Stats(errors);

                peakConsistency = Math.exp(-errorStats.mean());
            }

            return peakConsistency;
        }

        // ACF Series
        const detrend = this.detrend();
        const acf = new Stats(detrend).acf(maxPeriod).lags;

        const acfAbs = acf.map(Math.abs);
        const maxAcf = Math.max(...acfAbs.slice(minPeriod));

        // Very weak signal
        const N = detrend.length;
        const acfNoise = 1.96 / Math.sqrt(N);

        if (maxAcf < acfNoise) {
            return { score: 0, period: 0, components: {acfStrength: 0, peakConsistency: 0, cycleScore: 0} };
        }

        const threshold = Math.max(0.5 * maxAcf, acfNoise);

        // Find peaks
        const peaks: number[] = [];
        for (let k = minPeriod; k < maxPeriod - 1; k++) {
            if (
                Math.abs(acf[k]) > threshold &&
                Math.abs(acf[k]) > Math.abs(acf[k - 1]) &&
                Math.abs(acf[k]) > Math.abs(acf[k + 1])
             ) {
                peaks.push(k);
            }
        }

        if (peaks.length === 0) {
            return { score: 0, period: 0, components: {acfStrength: 0, peakConsistency: 0, cycleScore: 0} };
        }

        // Candidate periods:
        let bestPeriod = peaks[0];
        let bestScore = -1;

        for (const candidate of peaks.slice(0, 5)) {
            // Compute harmonic strength
            let harmonicStrength = 0;
            let count = 0;
            for (let m = 1; m * candidate < maxPeriod; m++) {
                const lag = m * candidate;
                if (lag >= acf.length) break;
                harmonicStrength += Math.abs(acf[lag]) / m;
                count++;
            }
            const normalizedHarmonic = count > 0 ? harmonicStrength / count : 0;

            const relatedPeaks = peaks.filter(
                p => Math.abs(p % candidate) <= candidate * 0.2 ||
                     Math.abs(candidate - (p % candidate)) <= candidate * 0.2
            );

            const consistency = getPeakConsistency(relatedPeaks, candidate);

            const tempScore = 0.5 * Math.abs(acf[candidate]) + 0.3 * normalizedHarmonic + 0.2 * consistency;

            if (tempScore > bestScore) {
                bestScore = tempScore;
                bestPeriod = candidate;
            }
        }

        const period = bestPeriod;
        const acfStrength = Math.abs(acf[period]);

        // Peak consistency
        const peakConsistency = getPeakConsistency(peaks, period);

        // Cyclic Mean
        const rollingMean = this.rollingMean(period);
        const meanStats = new Stats(rollingMean);

        const relativeStd = meanStats.std() / (this.std() + 1e-8);
        const relativeMad = meanStats.mad() / (this.mad() + 1e-8);

        const cycleScore = Math.min(1, relativeStd) * Math.exp(-relativeMad);

        const score = (peakConsistency + cycleScore + acfStrength) / 3;

        return {
            score: Math.min(1, score),
            period,
            components: {
                acfStrength, peakConsistency, cycleScore
            }
        };
    }
}

// Metrics
export class Metrics {
    private data: number[];
    private pred: number[];
    private size: number;

    constructor(data: number[], pred: number[]) {
        // Empty arrays
        if (data.length === 0 || pred.length === 0) {
            throw new ValidationError("Invalid Metrics", "Array is empty.");
        }

        // Equals array size
        if (data.length !== pred.length) {
            throw new ValidationError("Invalid Metrics", "Both arrays must have same size.");
        }

        this.data = data;
        this.pred = pred;
        this.size = data.length;
    }

    // Mean Absolute Error
    mae(): number {
        const n = this.size;

        const sum = this.data.reduce((sum, y, i) => {
            const diff = y - this.pred[i];
            return sum + Math.abs(diff);
        }, 0)

        return sum / n;
    }

    // Mean Squared Error
    mse(): number {
        const n = this.size;

        const sum = this.data.reduce((sum, y, i) => {
            const diff = y - this.pred[i];
            return sum + diff * diff
        }, 0)

        return sum / n
    }

    // Root Mean Squared Error
    rmse(): number {
        return Math.sqrt(this.mse());
    }

    // Mean Absolute Scaled Error
    mase(): number {
        const n = this.size;
        if (n < 2) return NaN;

        let errModel = 0;
        let errNaive = 0;

        for (let t = 1; t < n; t++) {
            errModel += Math.abs(this.data[t] - this.pred[t]);
            errNaive += Math.abs(this.data[t] - this.data[t - 1]);
        }

        return (errModel / (n - 1)) / (errNaive / (n - 1));
    }

    // Coefficient of determination
    r2(): number {
        let mean = new Stats(this.data).mean();

        const ssRes = this.data.reduce((sum, y, i) => {
            const res = y - this.pred[i];
            return sum + res * res;
        }, 0);

        const ssTot = this.data.reduce((sum, y) => {
            const dev = y - mean;
            return sum + dev * dev;
        }, 0);

        return 1 - ssRes / ssTot;
    }

    // Theil's U2
    u2(): number {
        const n =  this.size;

        let num = 0;
        let den = 0;

        for (let t = 1; t < n; t++) {
            num += (this.data[t] - this.pred[t]) ** 2;
            den += (this.data[t] - this.data[t - 1]) ** 2;
        }

        return Math.sqrt(num / den);
    }
}

// Tester
export class Tester {
    private rsd: number[];
    private size: number;

    constructor(rsd: number[]) {
        this.rsd = rsd;
        this.size = rsd.length;
    }

    // Correlation test
    residualCorrScore(acf: {lags: number[], lower: number, upper: number}): {
        score: number, reject: boolean
    } {
        const h = acf.lags.length;
        const lambda = 0.15; // Smoothness
        let weightDist = 0;
        let weightSum = 0;

        let dist = 0;
        for (let k = 1; k < h; k++) {
            const excess = Math.max(0, Math.abs(acf.lags[k]) - acf.upper);
            const w = Math.exp(-lambda * (k - 1));
            
            weightDist += w * excess;
            weightSum += w;
        }

        const score = 1 - weightDist / (weightSum * acf.upper);
        const reject = score > 0.5;

        return {score, reject};
    }

    // Normal distribution test
    jarqueBeraTest(alpha: number = 0.05): {
        jb: number, isNormal: boolean;
    } {
        const data = new Stats(this.rsd);
        const n = this.size;
        if (n < 8) {
            return {
                jb: NaN,
                isNormal: false
            };
        }

        const jb = data.jarqueBera();
        const z = {
            0.10: 4.605,
            0.05: 5.991,
            0.01: 9.210
        }[alpha]

        return {
            jb,
            isNormal: jb <= (z || 0.05)
        }
    }
}

interface AutoARIMAParams {
    p: number, d: number, q: number, P: number, D: number, Q: number, s: number;
}

interface InternalBest extends AutoARIMAParams {
    score: number;
}

interface AutoARIMAMetrics {
    mae: number, rmse: number, mase: number, r2: number, u2: number;
}

// AutoARIMA Interface
export interface AutoARIMAResult {
    params: AutoARIMAParams;
    metrics: AutoARIMAMetrics;
}

// AutoARIMA
export class AutoARIMA {
    private _train: number[];
    private _test: number[];

    private _params!: AutoARIMAParams;
    private _metrics!: AutoARIMAMetrics;
    private _residuals!: number[];
    private _fitted = false;

    constructor(data: number[], size: number) {
        const split = Math.floor(data.length * size);
        this._train = data.slice(0, split);
        this._test = data.slice(split);
    }

    get train(): number[] {
        return this._train;
    }

    get test(): number[] {
        return this._test;
    }

    get params(): AutoARIMAParams {
        if (!this._fitted) throw new ValidationError("Invalid AutoARIMA", "Params not adjusted");
        return this._params;
    }

    get metrics(): AutoARIMAMetrics {
        if (!this._fitted) throw new ValidationError("Invalid AutoARIMA", "Metrics not adjusted");
        return this._metrics;
    }

    get residuals(): number[] {
        if (!this._fitted) throw new ValidationError("Invalid AutoARIMA", "Residuals not adjusted");
        return this._residuals;
    }

    fit(options: {
        maxP: number;
        maxD: number;
        maxQ: number;
        maxSP?: number;
        maxSD?: number;
        maxSQ?: number;
        period?: number;
        lagAmount?: number;
        significance?: number;
    }): this {
        const {
            maxP, maxD, maxQ, maxSP = 0, maxSD = 0, maxSQ = 0, period = 0, lagAmount = 20, significance = 0.05
        } = options;

        let best: InternalBest | null = null;

        const orders = [];
        for (let p = 0; p <= maxP; p++)
            for (let d = 0; d <= maxD; d++)
                for (let q = 0; q <= maxQ; q++)
                    for (let P = 0; P <= maxSP; P++)
                        for (let D = 0; D <= maxSD; D++)
                            for (let Q = 0; Q <= maxSQ; Q++)
                                if (p + q + P + Q > 0)
                                    orders.push({ p, d, q, P, D, Q });
        
        for (const { p, d, q, P, D, Q } of orders) {
            const model = new ARIMA({
                p, d, q, P, D, Q, s: period, verbose: false
            }).train(this.train);

            const [pred] = model.predict(this.test.length);
            model.destroy();

            // Residuals
            const residuals = this.test.map((t, i) => t - pred[i]);
            this._residuals = residuals;

            // Metrics
            const metric = new Metrics(this.test, pred);

            const mase = metric.mase();
            const u2 = metric.u2();

            // Get rid of models with bad metrics
            if (mase > 2.5 || u2 > 2.5) continue;

            // Penalty
            const componentPenalty = 0.02;
            const diffPenalty = 0.2;
            const seasonalDiffPenalty = 0.4;

            const complexityPenalty = 
                componentPenalty * (p + q + P + Q) +
                diffPenalty * d +
                seasonalDiffPenalty * D
            ;
            
            const score =
                Math.log1p(Math.max(0, mase - 1)) +
                Math.log1p(Math.max(0, u2 - 1)) +
                complexityPenalty;

            if (
                !best ||
                score < best.score ||
                (
                    Math.abs(score - best.score) < 0.05 &&
                    (d + D) < (best.d + best.D)
                )
            ) {
                const mae = metric.mae();
                const rmse = metric.rmse();
                const r2 = metric.r2();

                best = {
                    p, d, q,
                    P, D, Q, s: period,
                    score
                };

                this._metrics = {
                    mae, rmse, mase, r2, u2
                };
            }
        }

        if (!best) {
            throw new ValidationError("No valid ARIMA model found", "Hint: Try different settings.", false);
        }

        const { score, ...params } = best;
        this._params = params;
        this._fitted = true;

        return this;
    }

    // Predict
    predict(steps: number): [number[], number[]]  {
        const data = [...this.train, ...this.test];

        const model = new ARIMA({
            ...this._params,
            verbose: false
        }).train(data);

        const pred = model.predict(steps)
        model.destroy();

        return pred;
    }
}