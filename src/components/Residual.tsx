// Residual
"use client"

import { ResidualCorrChart, ResidualDistChart } from "./Charts";

export default function Residual() {
    return (
        <div className="flex flex-col items-center justify-center">
            {/* Title */}
            <h2 className="px-[9%] py-8 bg-bg-second text-3xl font-semibold text-center w-full">Residuals</h2>

            <div className="w-full flex flex-col lg:flex-row items-stretch justify-center gap-4">
                <ResidualCorrChart />
                <ResidualDistChart />
            </div>
        </div>
    );
}