// Charts
"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";
const Plot = dynamic(() => import("react-plotly.js"), {
    ssr: false
});

import { DATA } from "../utils/data";
import { Stats } from "../utils/statistics";

const gridColor = "#3a3d45";
const textColor = "#f4f6f8";

// Time Series Data
export function TimeSeriesChart() {
    const data: Data[] = [{
        x: DATA.x, y: DATA.y, type: "scatter", mode: "lines", name: "Série Observada"
    }];
    
    const layout: Partial<Layout> = {
        title: { text: "Time Series" },
        xaxis: { title: { text: DATA.xName }, gridcolor: gridColor },
        yaxis: { title: { text: DATA.yName }, gridcolor: gridColor },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor },
        autosize: true
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "900px", height: "400px" }}
            useResizeHandler
        />
    );
}

function gaussianKernel(u: number) {
    return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
}

function silvermanBandwidth(data: number[]) {
    const n = data.length;
    const std = new Stats(data).std();
    return 1.06 * std * Math.pow(n, -1 / 5);
}

function kde(data: number[], xGrid: number[], bandwidth: number) {
    const n = data.length;

    return xGrid.map(x => {
        let sum = 0;
        for (const xi of data) {
            sum += gaussianKernel((x - xi) / bandwidth);
        }
        return sum / (n * bandwidth);
    });
}

// Distribution Chart
export function DistChart() {
    const dist = DATA.distStats.normal;

    const minX = Math.min(...dist);
    const maxX = Math.max(...dist);

    const xKDE = Array.from({ length: 300 }, (_, i) => 
        minX + (i / 299) * (maxX - minX)
    );

    const h = silvermanBandwidth(dist);
    const yKDE = kde(dist, xKDE, h);

    const data: Data[] = [
        {
            x: dist,
            type: "histogram",
            histnorm: "probability density",
            name: "Histogram",
            opacity: 0.6
        },
        {
            x: xKDE,
            y: yKDE,
            type: "scatter",
            mode: "lines",
            name: "KDE",
            line: { width: 2 }
        }
    ];

    const layout: Partial<Layout> = {
        title: { text: "Distribution of Data" },
        xaxis: { title: { text: DATA.yName }, gridcolor: gridColor },
        yaxis: { title: { text: "Density" }, gridcolor: gridColor },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor },
        bargap: 0.05
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "100%", height: 400 }}
            useResizeHandler
        />
    );
}

// Rolling Mean/Std
export function RollingDataChart() {
    const mean = DATA.rollingStats.mean;
    const std = DATA.rollingStats.std;

    const period = DATA.seasonalStats.period;
    const x = DATA.x.slice(period - 1, DATA.x.length);
    const y = DATA.y.slice(period - 1, DATA.y.length);

    const elements = [
        {x, y, name: "Data"},
        {x, y: mean, name: "Rolling Mean"},
        {x, y: std, name: "Rolling Std"}
    ];

    const data: Data[] = elements.map(el => (
        { x: el.x, y: el.y, type: "scatter", mode: "lines", name: el.name }
    ));

    const layout: Partial<Layout> = {
        title: { text: "Rolling Statistics" },
        xaxis: { title: { text: DATA.xName }, gridcolor: gridColor },
        yaxis: { title: { text: DATA.yName }, gridcolor: gridColor },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor },

        annotations: [
            {
                xref: "paper",
                yref: "paper",
                x: 0.5,
                y: 0.98,
                xanchor: "center",
                yanchor: "top",
                text: `<b>Window</b>: ${DATA.seasonalStats.period}`,
                showarrow: false,
                font: { size: 12 }
            }
        ],

        legend: { orientation: "v" }
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "100%", height: 400 }}
            useResizeHandler
        />
    );
}

// Stationary Gauge Score
export function StationaryGauge() {
    const score = Number(DATA.stationaryStats.score.toFixed(2));
    const meanScore = DATA.stationaryStats.meanScore.toFixed(DATA.config.precision);
    const varScore = DATA.stationaryStats.varScore.toFixed(DATA.config.precision);
    const trendScore = DATA.stationaryStats.trendScore.toFixed(DATA.config.precision);

    const data: Data[] = [{
        type: "indicator",
        mode: "gauge+number",
        value: score,

        gauge: {
            axis: { range: [0, 1] },
            steps: [
                { range: [0, 0.3], color: "#fca5a5" }, // None
                { range: [0.3, 0.5], color: "#fdd2d2" }, // Weak
                { range: [0.5, 0.7], color: "#fde68a" }, // Moderate
                { range: [0.7, 1.0], color: "#86efac" } // Strong
            ],
            threshold: {
                line: { color: "black", width: 3 },
                thickness: 0.75,
                value: DATA.config.stationaryScore
            }
        }
    }];

    const layout: Partial<Layout> = {
        title: { text: "Stationarity Score" },
        paper_bgcolor: "transparent",
        font: { color: textColor },

        annotations: [
            {
                xref: "paper",
                yref: "paper",
                x: 0.5,
                y: -0.25,
                xanchor: "center",
                yanchor: "bottom",
                text: `<b>Mean</b>: ${meanScore}    <b>Deviation</b>: ${varScore}    <b>Tendency</b>: ${trendScore}`,
                showarrow: false,
                font: { size: 12 }
            }
        ],
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "100%", height: 400 }}
            useResizeHandler
        />
    );
}

// Seasonal Gauge Score
export function SeasonalGauge() {
    const score = Number(DATA.seasonalStats.score.toFixed(2));
    const peakConsistency = DATA.seasonalStats.peakConsistency.toFixed(DATA.config.precision);
    const cycleScore = DATA.seasonalStats.cycleScore.toFixed(DATA.config.precision);
    const acfStrength = DATA.seasonalStats.acfStrength.toFixed(DATA.config.precision);

    const data: Data[] = [{
        type: "indicator",
        mode: "gauge+number",
        value: score,

        gauge: {
            axis: { range: [0, 1] },
            steps: [
                { range: [0, 0.3], color: "#fca5a5" }, // None
                { range: [0.3, 0.5], color: "#fdd2d2" }, // Weak
                { range: [0.5, 0.7], color: "#fde68a" }, // Medium
                { range: [0.7, 1.0], color: "#86efac" } // Strong
            ],
            threshold: {
                line: { color: "black", width: 3 },
                thickness: 0.75,
                value: DATA.config.seasonalScore
            }
        }
    }];

    const layout: Partial<Layout> = {
        title: { text: "Seasonality Score" },
        paper_bgcolor: "transparent",
        font: { color: textColor },

        annotations: [
            {
                xref: "paper",
                yref: "paper",
                x: 0.5,
                y: -0.25,
                xanchor: "center",
                yanchor: "bottom",
                text: `<b>Consistency</b>: ${peakConsistency}    <b>Cyclic</b>: ${cycleScore}    <b>Correlation</b>: ${acfStrength}`,
                showarrow: false,
                font: { size: 12 }
            }
        ],
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "100%", height: 400 }}
            useResizeHandler
        />
    );
}

interface PartialCorrelation {
    partial: boolean
}

export function CorrelationChart({partial}: PartialCorrelation) {
    const corr = partial ? DATA.pacfStats : DATA.acfStats;

    const lags = corr.lags;
    const upper = corr.upper;
    const lower = corr.lower;

    const x = Array.from({ length: lags.length }, (_, i) => i);

    const stems = x.map((lag, i) => ({
        x: [lag, lag],
        y: [0, lags[i]],
        mode: "lines",
        line: { color: 'blue', width: 2 },
        showlegend: false
    }));

    const zeroLag: Data = {
        x: [0],
        y: [lags[0]],
        mode: "markers",
        marker: {
            symbol: "x",
            size: 12,
            color: "red"
        },
        showlegend: false
    };

    const insideCI = x
        .map((lag, i) => ({ lag, value: lags[i] }))
        .filter(({ lag, value }) =>
            lag != 0 && value >= lower && value <= upper
        );
    
    const outsideCI = x
        .map((lag, i) => ({ lag, value: lags[i] }))
        .filter(({ lag, value }) =>
            lag != 0 && (value < lower || value > upper)
        );

    const outsideCITrace: Data = {
        x: outsideCI.map(d => d.lag),
        y: outsideCI.map(d => d.value),
        mode: "markers",
        marker: {
            symbol: "circle",
            size: 12,
            color: "green"
        },
        name: "Significant",
        legendgroup: "marker",
        showlegend: true
    };

    const insideCITrace: Data = {
        x: insideCI.map(d => d.lag),
        y: insideCI.map(d => d.value),
        mode: "markers",
        marker: {
            symbol: "circle",
            size: 6,
            color: "red"
        },
        legendgroup: "marker",
        showlegend: false
    };

    const ciUpper: Data = {
        x,
        y: Array(x.length).fill(upper),
        mode: "lines",
        line: { dash: "dash", color: "gray" },
        legendgroup: "ci",
        name: "Confidence Interval",
        showlegend: true
    };

    const ciMargin: Data = {
        x,
        y: Array(x.length).fill(lower),
        mode: "lines",
        line: { width: 0 },
        fill: "tonexty",
        fillcolor: "rgba(169, 169, 169, 0.1)",
        legendgroup: "ci",
        showlegend: false
    };

    const ciLower: Data = {
        x,
        y: Array(x.length).fill(lower),
        mode: "lines",
        line: { dash: "dash", color: "gray" },
        legendgroup: "ci",
        showlegend: false
    };

    const name = partial ? "PACF" : "ACF";
    const title = { text: 
        partial ? "Partial Autocorrelation - AR(p)" : "Autocorrelation - MA(q)"
    }

    const data: Data[] = [
        ...stems,
        {
            x,
            y: lags,
            marker: { size: 6 },
            name: name
        },
        
        zeroLag,
        outsideCITrace,
        insideCITrace,

        ciUpper,
        ciMargin,
        ciLower
    ];

    const layout: Partial<Layout> = {
        title: title,
        xaxis: { title: { text: "Lag" }, dtick: 1, gridcolor: gridColor },
        yaxis: { title: { text: "Correlation" }, range: [-1.15, 1.15], gridcolor: gridColor },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor }
    }

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "100%", height: "400px" }}
            useResizeHandler
        />
    );
}

// Seasonal Correlation Chart
export function SeasonalCorrelationChart({partial}: PartialCorrelation) {
    const corr = partial ? DATA.spacfStats : DATA.sacfStats;

    const lags = corr.lags;
    const upper = corr.upper;
    const lower = corr.lower;

    const x = Array.from({ length: lags.length }, (_, i) => i);

    const stems = x.map((lag, i) => ({
        x: [lag, lag],
        y: [0, lags[i]],
        mode: "lines",
        line: { color: 'blue', width: 2 },
        showlegend: false
    }));

    const zeroLag: Data = {
        x: [0],
        y: [lags[0]],
        mode: "markers",
        marker: {
            symbol: "x",
            size: 12,
            color: "red"
        },
        showlegend: false
    };

    const ignoredLags = [];
    const seasonalInsideCI = [];
    const seasonalOutsideCI = [];

    for (let i = 1; i < lags.length; i++) {
        const value = lags[i];

        if (i % DATA.seasonalStats.period === 0) {
            if (value >= lower && value <= upper) {
                seasonalInsideCI.push({ lag: i, value });
            } else {
                seasonalOutsideCI.push({ lag: i, value });
            }
        } else {
            ignoredLags.push({ lag: i, value });
        }
    }

    const ignoredTrace: Data = {
        x: ignoredLags.map(d => d.lag),
        y: ignoredLags.map(d => d.value),
        mode: "markers",
        marker: {
            size: 6,
            color: "gray"
        },
        legendgroup: "marker",
        showlegend: false
    }

    const seasonalInsideTrace: Data = {
        x: seasonalInsideCI.map(d => d.lag),
        y: seasonalInsideCI.map(d => d.value),
        mode: "markers",
        marker: {
            size: 12,
            color: "red"
        },
        showlegend: false
    };

    const seasonalOutsideTrace: Data = {
        x: seasonalOutsideCI.map(d => d.lag),
        y: seasonalOutsideCI.map(d => d.value),
        mode: "markers",
        marker: {
            size: 12,
            color: "green"
        },
        name: "Significant",
        legendgroup: "marker",
        showlegend: true
    };

    const ciUpper: Data = {
        x,
        y: Array(x.length).fill(upper),
        mode: "lines",
        line: { dash: "dash", color: "gray" },
        legendgroup: "ci",
        name: "Confidence Interval",
        showlegend: true
    };

    const ciMargin: Data = {
        x,
        y: Array(x.length).fill(lower),
        mode: "lines",
        line: { width: 0 },
        fill: "tonexty",
        fillcolor: "rgba(169, 169, 169, 0.1)",
        legendgroup: "ci",
        showlegend: false
    };

    const ciLower: Data = {
        x,
        y: Array(x.length).fill(lower),
        mode: "lines",
        line: { dash: "dash", color: "gray" },
        legendgroup: "ci",
        showlegend: false
    };

    const name = partial ? "SPACF" : "SACF";
    const title = { text: 
        partial ? "Seasonal Partial Autocorrelation - SAR(P)" : "Seasonal Autocorrelation - SMA(Q)" 
    };

    const data: Data[] = [
        ...stems,
        {
            x,
            y: lags,
            marker: { size: 6 },
            name: name
        },
        
        zeroLag,
        ignoredTrace,
        seasonalInsideTrace,
        seasonalOutsideTrace,

        ciUpper,
        ciMargin,
        ciLower
    ];

    const layout: Partial<Layout> = {
        title: title,
        xaxis: { title: { text: "Lag" }, dtick: 1, showgrid: false },
        yaxis: { title: { text: "Correlation" }, range: [-1.15, 1.15], showgrid: false },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor }
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "100%", height: "400px" }}
            useResizeHandler
        />
    );
}

// Metric Chart
export function MetricChart() {
    const time = DATA.x.slice(DATA.splitData.train.length);
    const test = DATA.splitData.test;
    const rsd = DATA.splitData.rsd;

    const pred = test.map((y, i) => y - rsd[i]);
    const upper = pred.map((y, i) => y + Math.abs(rsd[i]));
    const lower = pred.map((y, i) => y - Math.abs(rsd[i]));

    const data: Data[] = [
        {x: time, y: upper, type: "scatter", mode: "lines", line: { width: 0 }, showlegend: false},
        {x: time, y: lower, type: "scatter", mode: "lines", fill: "tonexty", fillcolor: "rgba(125, 0, 0, 0.2)", line: { width: 0 }, name: "Error Margin"},
        {x: time, y: pred, type: "scatter", mode: "lines+markers", name: "Prediction", line: { color: "#f97316"}},
        {x: time, y: test, type: "scatter", mode: "lines+markers", name: "Test", line: { color: "#166543" }}
    ];

    const layout: Partial<Layout> = {
        title: { text: "Avaliation" },
        xaxis: { title: { text: DATA.xName }, gridcolor: gridColor },
        yaxis: { title: { text: DATA.yName }, gridcolor: gridColor },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor },
        autosize: true,
        legend: { orientation: "v" }
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "900px", height: "400px" }}
            useResizeHandler
        />
    );
}

// Residual Autocorrelation Chart
export function ResidualCorrChart() {
    const acf = DATA.rsdCorr.correlation.lags
    const upper = DATA.rsdCorr.correlation.upper;
    const lower = DATA.rsdCorr.correlation.lower;

    const score = DATA.rsdCorr.score.toFixed(DATA.config.precision);
    const reject = DATA.rsdCorr.reject;
    const resultText = reject
        ? `<span style="color:green"><b>FALSE</b></span>`
        : `<span style="color:red"><b>TRUE</b></span>`

    const x = Array.from({ length: acf.length }, (_, i) => i);

    const stems = x.map((lag, i) => ({
        x: [lag, lag],
        y: [0, acf[i]],
        mode: "lines",
        line: { color: 'blue', width: 2 },
        showlegend: false
    }));

    const zeroLag: Data = {
        x: [0],
        y: [acf[0]],
        mode: "markers",
        marker: {
            symbol: "x",
            size: 12,
            color: "red"
        },
        showlegend: false
    };

    const insideCI = x
        .map((lag, i) => ({ lag, value: acf[i] }))
        .filter(({ lag, value }) =>
            lag != 0 && value >= lower && value <= upper
        );
    
    const outsideCI = x
        .map((lag, i) => ({ lag, value: acf[i] }))
        .filter(({ lag, value }) =>
            lag != 0 && (value < lower || value > upper)
        );
    
    const insideCITrace: Data = {
        x: insideCI.map(d => d.lag),
        y: insideCI.map(d => d.value),
        mode: "markers",
        marker: {
            symbol: "circle",
            size: 8,
            color: "green"
        },
        name: "Significant",
        legendgroup: "marker",
        showlegend: true
    };

    const outsideCITrace: Data = {
        x: outsideCI.map(d => d.lag),
        y: outsideCI.map(d => d.value),
        mode: "markers",
        marker: {
            symbol: "circle",
            size: 6,
            color: "red"
        },
        legendgroup: "marker",
        showlegend: false
    };

    const ciUpper: Data = {
        x,
        y: Array(x.length).fill(upper),
        mode: "lines",
        line: { dash: "dash", color: "gray" },
        legendgroup: "ci",
        name: "Confidence Interval",
        showlegend: true
    };

    const ciMargin: Data = {
        x,
        y: Array(x.length).fill(lower),
        mode: "lines",
        line: { width: 0 },
        fill: "tonexty",
        fillcolor: "rgba(169, 169, 169, 0.1)",
        legendgroup: "ci",
        showlegend: false
    };

    const ciLower: Data = {
        x,
        y: Array(x.length).fill(lower),
        mode: "lines",
        line: { dash: "dash", color: "gray" },
        legendgroup: "ci",
        showlegend: false
    };

    const data: Data[] = [
        ...stems,
        {
            x,
            y: acf,
            marker: { size: 6 },
            name: "ACF"
        },
        
        zeroLag,
        insideCITrace,
        outsideCITrace,

        ciUpper,
        ciMargin,
        ciLower
    ];

    const layout: Partial<Layout> = {
        title: { text: "Autocorrelation" },
        xaxis: { title: { text: "Lag" }, gridcolor: gridColor},
        yaxis: { title: { text: "Correlation" }, gridcolor: gridColor, range: [-1.15, 1.15] },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor },
        annotations: [
            {
                xref: "paper",
                yref: "paper",
                x: 0.525,
                y: 0.98,
                xanchor: "center",
                yanchor: "top",
                text: `<b>Score</b>: ${score}, <b>Correlated</b>: ${resultText}`,
                showarrow: false,
                font: { size: 12 }
            }
        ],
    }

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "100%", height: "400px" }}
            useResizeHandler
        />
    );
}

// Residual Dist Chart
export function ResidualDistChart() {
    const theoretical = DATA.rsdDist.Q_theoretical;
    const empirical = DATA.rsdDist.Q_empirical;

    const score = DATA.rsdDist.jb_score.toFixed(DATA.config.precision);
    const isNormal = DATA.rsdDist.isNormal;
    const resultText = isNormal
        ? `<span style="color:green"><b>TRUE</b></span>`
        : `<span style="color:red"><b>FALSE</b></span>`

    const data: Data[] = [{
        x: theoretical, y: empirical,
        mode: "markers", type: "scatter", name: "Sample Data", marker: { color: "blue", size: 8 }
    },
    {
        x: [Math.min(...theoretical), Math.max(...theoretical)],
        y: [Math.min(...empirical), Math.max(...empirical)],
        mode: "lines", type: "scatter", name: "Reference Line", line: { color: "red", dash: "dash" }
    }];

    const layout: Partial<Layout> = {
        title: { text: "Normal QQ Plot" },
        xaxis: { title: { text: "Theorical Quantiles" }, gridcolor: gridColor },
        yaxis: { title: { text: "Sample Quantiles" }, gridcolor: gridColor },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor },

        annotations: [
            {
                xref: "paper",
                yref: "paper",
                x: 0.485,
                y: 0.98,
                xanchor: "center",
                yanchor: "top",
                text: `<b>JB</b>: ${score}, <b>Normal</b>: ${resultText}`,
                showarrow: false,
                font: { size: 12 }
            }
        ],
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "100%", height: "400px" }}
            useResizeHandler
        />
    );
}

// Prediction Chart
export function PredictionChart() {
    const train = DATA.splitData.train;
    const test = DATA.splitData.test;

    const pred = DATA.predValues.data;
    const interval = DATA.predValues.interval;

    const trainSize = train.length;
    const xTrain = DATA.x.slice(0, trainSize);
    const xTest = DATA.x.slice(trainSize);

    const isSeasonal = DATA.seasonalStats.score <= DATA.config.seasonalScore;
    const modelName = (isSeasonal)
    ? `ARIMA(${DATA.arimaParams.p}, ${DATA.arimaParams.d}, ${DATA.arimaParams.q})`
    : `SARIMA(${DATA.arimaParams.p}, ${DATA.arimaParams.d}, ${DATA.arimaParams.q})(${DATA.arimaParams.P}, ${DATA.arimaParams.D}, ${DATA.arimaParams.Q})[${DATA.seasonalStats.period}]`;
    
    const lastX = DATA.x[DATA.x.length - 1].getTime();
    const step = DATA.x[1].getTime() - DATA.x[0].getTime();

    const xPred: Date[] = Array.from(
        { length: pred.length },
        (_, i) => new Date(lastX + step * (i + 1))
    );

    const upper = pred.map((v, i) => v + interval[i]);
    const lower = pred.map((v, i) => v - interval[i]);

    const data: Data[] = [
        {x: xTrain, y: train, type: "scatter", mode: "lines", name: "Train", line: { color: "#dc2626" }},
        {x: xTest, y: test, type: "scatter", mode: "lines", name: "Test", line: { color: "#166543" }},
        {x: xPred, y: lower, type: "scatter", mode: "lines", line: { width: 0 }, showlegend: false},
        {x: xPred, y: upper, type: "scatter", mode: "lines", fill: "tonexty", fillcolor: "rgba(249,115,22,0.2)", line: { width: 0 }, name: "Confidence Interval"},
        {x: xPred, y: pred, type: "scatter", mode: "lines+markers", name: "Forecast", line: { color: "#f97316", dash: "dash" }}
    ];

    const layout: Partial<Layout> = {
        title: { text: `Best Model: ${modelName}` },
        xaxis: { title: { text: DATA.xName }, gridcolor: gridColor },
        yaxis: { title: { text: DATA.yName }, gridcolor: gridColor },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: textColor },
        autosize: true,
        legend: { orientation: "v" }
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: "85%", height: "400px" }}
            useResizeHandler
        />
    );
}