// Config.ts

export enum Duplicates {
    KEEP_FIRST = "Keep first",
    KEEP_LAST = "Keep last",
    AVERAGE = "Average",
    SUM = "Sum"
};

export enum MissingValues {
    FORWARD_FILL = "Forward fill",
    BACKWARD_FILL = "Backward fill",
    AVERAGE = "Average",
    MEDIAN = "Median",
    INTERPOLATE = "Interpolate"
};

export enum Outliers {
    NONE = "None",
    IQR_SET_MEDIAN = "IQR median",
    IQR_CLAMP = "IQR clamp",
    ZSCORE_CLAMP = "Zscore clamp"
};

export enum Transform {
    NONE = "None",
    LOG = "Log",
    MIN_MAX = "Min-Max"
};

export type ConfigType = {
    duplicates: Duplicates;
    missingValues: MissingValues;
    outliers: Outliers;
    transform: Transform;
    splitSize: number;
    precision: number;
    lagAmount: number;
    significance: number;
    stationaryScore: number;
    seasonalScore: number;
};

export const CONFIG: ConfigType = {
    duplicates: Duplicates.KEEP_FIRST,
    missingValues: MissingValues.AVERAGE,
    outliers: Outliers.NONE,
    transform: Transform.NONE,
    splitSize: 0.8,
    precision: 2,
    lagAmount: 20,
    significance: 0.05,
    stationaryScore: 0.5,
    seasonalScore: 0.5
};