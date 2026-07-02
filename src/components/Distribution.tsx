// Distribution
"use client"

import { DistChart, RollingDataChart } from './Charts';

export default function Distribution() {
    return (
        <div className="flex flex-col items-center justify-center">
            {/* Title */}
            <h2 className="px-[9%] py-8 bg-bg-second text-3xl font-semibold text-center w-full">Distribution</h2>

            {/* Charts */}
            <div className="flex items-center gap-8">
                <DistChart />
                <RollingDataChart />
            </div>
        </div>
    );
}