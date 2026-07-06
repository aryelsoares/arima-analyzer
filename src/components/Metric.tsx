// Residuals
"use client";

import { DATA } from "../utils/data";
import { MetricChart } from "./Charts";

export default function Metric() {
    const metricTable = [
        { label: "MAE", value: DATA.metricStats.mae.toFixed(DATA.config.precision) },
        { label: "RMSE", value: DATA.metricStats.rmse.toFixed(DATA.config.precision) },
        { label: "R2", value: DATA.metricStats.r2.toFixed(DATA.config.precision) },
        { label: "U2", value: DATA.metricStats.u2.toFixed(DATA.config.precision) },
        { label: "MASE", value: DATA.metricStats.mase.toFixed(DATA.config.precision) }
    ];

    return (
        <div className="flex flex-col items-center justify-center">
            {/* Title */}
            <h2 className="px-[9%] py-8 bg-bg-second text-3xl font-semibold text-center w-full">Metrics</h2>

            <div className="w-full flex items-center justify-center">
                {/* Table */}
                <table className="border text-lg">
                    <thead>
                        <tr className="bg-bg-third">
                            <th className="border px-3 py-2 text-left">Metric</th>
                            <th className="border px-3 py-2 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metricTable.map(s => (
                            <tr key={s.label}>
                                <td className="border px-3 py-2 text-left">{s.label}</td>
                                <td className="border px-3 py-2 text-right">{s.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Metric Chart */}
                <MetricChart />
            </div>
        </div>
    );
}