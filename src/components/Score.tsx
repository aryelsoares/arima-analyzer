// Score
"use client"

import { StationaryGauge, SeasonalGauge} from "./Charts";

export default function Score() {
    return (
        <div className="flex flex-col items-center justify-center">
            {/* Title */}
            <h2 className="px-[9%] py-8 bg-bg-second text-3xl font-semibold text-center w-full">Stationarity and Seasonality Scores</h2>

            {/* Charts */}
            <div className="flex items-center gap-4">
                <StationaryGauge />
                <SeasonalGauge />
            </div>
        </div>
    );
}