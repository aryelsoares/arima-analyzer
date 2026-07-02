// ETL

import { DATA } from "./data";
import { Duplicates, MissingValues, Outliers, Transform } from "./config";
import { Stats } from "./statistics";

// Duplicates
type Series = { time: Date[], data: number[] };
function applyDuplicates(time: Date[], data: number[], duplicates: Duplicates): Series {
    const map = new Map<number, number[]>();

    for (let i = 0; i < time.length; i++) {
        const t = time[i].getTime();
        if (!map.has(t)) map.set(t, []);
        map.get(t)!.push(data[i]);
    }

    const resultTime: Date[] = [];
    const resultData: number[] = [];

    for (const [t, values] of map.entries()) {
        let value: number;

        switch (duplicates) {
            case Duplicates.KEEP_LAST:
                value = values[values.length - 1];
                break;
            case Duplicates.AVERAGE:
                value = new Stats(values).mean();
                break;
            case Duplicates.SUM:
                value = new Stats(values).sum();
                break;
            default: // Keep first
                value = values[0];
                break;
        }

        resultTime.push(new Date(t));
        resultData.push(value);
    }

    // Time order
    const sorted = resultTime
        .map((t, i) => ({ t, v: resultData[i] }))
        .sort((a, b) => a.t.getTime() - b.t.getTime());
    
    return {
        time: sorted.map(e => e.t),
        data: sorted.map(e => e.v)
    };
}

// Missing Values
function applyMissingValues(data: number[], missingValues: MissingValues): number[] {
    const result = [...data];

    const valid = result.filter(v => !Number.isNaN(v));
    const stats = new Stats(valid);

    for (let i = 0; i < result.length; i++) {
        if (!Number.isNaN(result[i])) continue;

        switch (missingValues) {
            case MissingValues.BACKWARD_FILL:
                result[i] = i > 0 ? result[i - 1] : NaN;
                break;
            case MissingValues.AVERAGE:
                result[i] = stats.mean();
                break;
            case MissingValues.MEDIAN:
                result[i] = stats.median();
                break;
            case MissingValues.INTERPOLATE: {
                let left = i - 1;
                let right = i + 1;

                while (left >= 0 && Number.isNaN(result[left])) left--;
                while (right < result.length && Number.isNaN(result[right])) right++;

                if (left >= 0 && right < result.length) {
                    result[i] = result[left] + (result[right] - result[left]) * ((i - left) / (right - left));
                } else {
                    result[i] = NaN;
                }

                break;
            }
            default: // FOWARD_FILL
                result[i] = i < result.length - 1 ? result[i + 1] : NaN;
                break;
        }
    }

    return result;
}

// Outliers
function applyOutliers(data: number[], outliers: Outliers): number[] {
    if (outliers === Outliers.NONE) return [...data];

    const result = [...data];
    const stats = new Stats(result);

    const median = stats.median();
    const mean = stats.mean();
    const std = stats.std();

    const q1 = stats.q1();
    const q3 = stats.q3();
    const iqr = q3 - q1;

    const lowerIQR = q1 - 1.5 * iqr;
    const upperIQR = q3 + 1.5 * iqr;

    for (let i = 0; i < result.length; i++) {
        const x = result[i];

        switch (outliers) {
            case Outliers.SET_MEDIAN:
                result[i] = median;
                break;
            case Outliers.IQR_SET_MEDIAN:
                if (x < lowerIQR || x > upperIQR) {
                    result[i] = median;
                }
                break;
            case Outliers.IQR_CLAMP:
                if (x < lowerIQR) result[i] = lowerIQR;
                if (x > upperIQR) result[i] = upperIQR;
                break;
            case Outliers.ZSCORE_CLAMP:
                if (Math.abs((x - mean) / std) > 3) {
                    result[i] = Math.sign(x - mean) > 0
                        ? mean + 3 * std
                        : mean - 3 * std;
                }
                break;
        }
    }

    return result;
}

// Transform
function applyTransform(data: number[], transform: Transform): number[] {
    switch (transform) {
        case Transform.LOG:
            return data.map(v => (v > 0 ? Math.log(v) : 0));
        case Transform.MIN_MAX:
            const min = Math.min(...data);
            const max = Math.max(...data);

            if (min === max) return data.map(() => 0);

            return data.map(v => (v - min) / (max - min));
        default:
            return data;
    }
}

// ETL
export function etl(x: Date[], y: number[]) {
    
    /* Missing Values */
    const sanitized = applyMissingValues(y, DATA.config.missingValues);

    /* Duplicates */
    const series = applyDuplicates(x, sanitized, DATA.config.duplicates);

    const X = series.time;
    let Y = series.data;

    /* Outliers */

    /* Transform */
    Y = applyTransform(Y, DATA.config.transform);

    // Save data
    DATA.x = X;
    DATA.y = Y;
}