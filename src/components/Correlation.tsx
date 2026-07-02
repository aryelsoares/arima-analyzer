// Correlation
"use client"

import { CorrelationChart } from "./Charts";
import { DATA } from "../utils/data";

export default function Correlation() {
    const isSeasonal = DATA.seasonalStats.score >= DATA.config.seasonalScore && DATA.seasonalStats.period > 1;

    return (
        <div className="flex flex-col">
            {/* Title */}
            <h2 className="px-[9%] py-8 bg-bg-second text-3xl font-semibold text-center w-full"> Correlation </h2>

            {/* Correlation Charts */}
            <div className="flex items-center gap-4">
                <CorrelationChart seasonal={false} partial={false} />
                <CorrelationChart seasonal={false} partial={true} />
            </div>

            {/* Seasonal Correlation Chart */}
            {isSeasonal && (
                <div className="flex items-center gap-4 mt-4">
                    <CorrelationChart seasonal={true} partial={false} />
                    <CorrelationChart seasonal={true} partial={true} />
                </div>
            )}
        </div>
    );
}