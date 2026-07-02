// Descriptive
"use client"

import { TimeSeriesChart } from "./Charts";
import { DATA } from "../utils/data";

export default function Descriptive() {
    const descriptiveTable = [
        { label: "N", value: DATA.descStats.n },
        { label: "Mean", value: DATA.descStats.mean.toFixed(DATA.config.precision) },
        { label: "Median", value: DATA.descStats.median.toFixed(DATA.config.precision) },
        { label: "Fashion", value: DATA.descStats.fashion?.toFixed(DATA.config.precision) },
        { label: "Deviation", value: DATA.descStats.std.toFixed(DATA.config.precision) },
        { label: "Min", value: DATA.descStats.min.toFixed(DATA.config.precision) },
        { label: "Max", value: DATA.descStats.max.toFixed(DATA.config.precision) }
    ];

    return (
        <div className="flex flex-col items-center justify-center mt-20">
            {/* Title */}
            <h2 className="px-[9%] py-8 bg-bg-second text-3xl font-semibold text-center w-full">Descriptive Statistics</h2>

            <div className="flex items-center">
                {/* Table */}
                <table className="border text-lg">
                    <thead>
                        <tr className="bg-bg-third">
                            <th className="border px-3 py-2 text-left">Statistics</th>
                            <th className="border px-3 py-2 text-right">Values</th>
                        </tr>
                    </thead>
                    <tbody>
                        {descriptiveTable.map(s => (
                            <tr key={s.label}>
                                <td className="border px-3 py-2">{s.label}</td>
                                <td className="border px-3 py-2 text-right">{s.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Time Series Chart */}
                <div className="flex-1 min-w-0">
                    <TimeSeriesChart />
                </div>
            </div>
        </div>
    );
}