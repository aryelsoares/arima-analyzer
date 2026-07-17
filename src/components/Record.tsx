// Record
"use client"

import { DATA } from "../utils/data";

export default function Record() {
    const results = DATA.results.sort((a, b) => a.score - b.score);
    const period = DATA.seasonalStats.period;
    const precision = DATA.config.precision;

    return (
        <div className="flex flex-col items-center justify-center mt-20">
            {/* Title */}
            <h2 className="px-[9%] py-8 bg-bg-second text-3xl font-semibold text-center w-full">Records</h2>
        
            <div className="w-full sm:w-4xl md:w-5xl lg:w-7xl overflow-auto max-h-124 mt-20">
                <div className="min-w-max border-collapse">
                    {/* Table */}
                    <table className="border text-lg">
                        <thead>
                            <tr className="bg-bg-third">
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">ID</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">Evaluation</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">Model</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">AIC</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">BIC</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">HQC</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">MAE</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">RMSE</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">R2</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">U2</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">MASE</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">Corr</th>
                                <th className="sticky top-0 z-10 border bg-bg-third px-3 py-2">Normality</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((m, i) => (
                                <tr key={i}>
                                    <td className="border font-semibold px-3 py-2 text-center">{i + 1}</td>

                                    <td className="border px-3 py-2 text-center">
                                        {((1.0 - m.score) * 100.0).toFixed(precision) + "%"}
                                    </td>

                                    <td className="border px-3 py-2 text-left">
                                        {
                                            (m.P === 0 && m.D === 0 && m.Q === 0)
                                            ? `ARIMA(${m.p}, ${m.d}, ${m.q})`
                                            : `SARIMA(${m.p}, ${m.d}, ${m.q})(${m.P}, ${m.D}, ${m.Q})[${period}]`
                                        }
                                    </td>

                                    <td className="border px-3 py-2 text-center">{m.aic.toFixed(precision)}</td>
                                    <td className="border px-3 py-2 text-center">{m.bic.toFixed(precision)}</td>
                                    <td className="border px-3 py-2 text-center">{m.hqc.toFixed(precision)}</td>

                                    <td className="border px-3 py-2 text-center">{m.mae.toFixed(precision)}</td>
                                    <td className="border px-3 py-2 text-center">{m.rmse.toFixed(precision)}</td>
                                    <td className="border px-3 py-2 text-center">{m.r2.toFixed(precision)}</td>
                                    <td className="border px-3 py-2 text-center">{m.u2.toFixed(precision)}</td>
                                    <td className="border px-3 py-2 text-center">{m.mase.toFixed(precision)}</td>

                                    <td className="border px-3 py-2 text-center">
                                        <span
                                            className={`font-semibold ${
                                                m.corr.reject ? "text-green-500" : "text-red-500"
                                            }`}
                                        >
                                            {m.corr.score.toFixed(precision)}
                                        </span>
                                    </td>

                                    <td className="border px-3 py-2 text-center">
                                        <span
                                            className={`font-semibold ${
                                                m.norm.isNormal ? "text-green-500" : "text-red-500"
                                            }`}
                                        >
                                            {m.norm.jb.toFixed(precision)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}