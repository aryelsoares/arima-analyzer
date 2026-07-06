// Data
import { ConfigType, CONFIG } from "./config";

type DescType = {n: number, mean: number, median: number, mode: number | null, std: number, min: number, max: number};
type DistType = {normal: number[], skew: number, kurtosis: number};
type SeasonalType = {score: number, period: number, acfStrength: number, peakConsistency: number, cycleScore: number};
type RollingType = {mean: number[], std: number[]};
type StationaryType = {score: number, meanScore: number, varScore: number, trendScore: number};
type CorrelationType = {lags: number[], lower: number, upper: number};
type SplitType = {train: number[], test: number[], rsd: number[]};
type ArimaType = {p: number, d: number, q: number, P: number, D: number, Q: number, s: number};
type PredType = {data: number[], interval: number[]};
type MetricType = {mae: number, rmse: number, mase: number, r2: number, u2: number};
type RsdDistType = {Q_theoretical: number[], Q_empirical: number[], jb_score: number, isNormal: boolean};
type RsdCorrType = {correlation: {lags: number[], lower: number, upper: number}, score: number, reject: boolean}

export type DataType = {
  fileName: string,
  xName: string, yName: string,
  x: Date[], y: number[],
  descStats: DescType,
  distStats: DistType,
  seasonalStats: SeasonalType,
  rollingStats: RollingType,
  stationaryStats: StationaryType,
  stationaryData: number[],
  seasonalStationaryStats: StationaryType,
  seasonalStationaryData: number[],
  acfStats: CorrelationType,
  pacfStats: CorrelationType,
  sacfStats: CorrelationType,
  spacfStats: CorrelationType,
  splitData: SplitType,
  arimaParams: ArimaType,
  predValues: PredType,
  metricStats: MetricType,
  rsdDist: RsdDistType,
  rsdCorr: RsdCorrType,
  config: ConfigType,
};

export function resetData(): DataType {
  return ({
    fileName: "",
    xName: "", yName: "",
    x: [], y: [],
    descStats: {n: 0, mean: 0, median: 0, mode: 0, std: 0, min: 0, max: 0},
    distStats: {normal: [], skew: 0, kurtosis: 0},
    seasonalStats: {score: 0, period: 0, acfStrength: 0, peakConsistency: 0, cycleScore: 0},
    rollingStats: {mean: [], std: []},
    stationaryStats: {score: 0, meanScore: 0, varScore: 0, trendScore: 0},
    stationaryData: [],
    seasonalStationaryStats: {score: 0, meanScore: 0, varScore: 0, trendScore: 0},
    seasonalStationaryData: [],
    acfStats: {lags: [], lower: 0, upper: 0},
    pacfStats: {lags: [], lower: 0, upper: 0},
    sacfStats: {lags: [], lower: 0, upper: 0},
    spacfStats: {lags: [], lower: 0, upper: 0},
    splitData: {train: [], test: [], rsd: []},
    arimaParams: {p: 0, d: 0, q: 0, P: 0, D: 0, Q: 0, s: 0},
    predValues: {data: [], interval: []},
    metricStats: {mae: 0, rmse: 0, mase: 0, r2: 0, u2: 0},
    rsdDist: {Q_theoretical: [], Q_empirical: [], jb_score: 0, isNormal: false},
    rsdCorr: {correlation: { lags: [], lower: 0, upper: 0 }, score: 0, reject: false},
    config: CONFIG
  });
}

/* DATA */
export const DATA: DataType = resetData();