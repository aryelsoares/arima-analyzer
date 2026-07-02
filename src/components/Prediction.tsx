// Prediction
"use client"

import { PredictionChart } from "./Charts";

export default function Prediction() {
    return (
        <section className="flex flex-col items-center">
            {/* Title */}
            <h2 className="px-[9%] py-8 bg-bg-second text-3xl font-semibold text-center w-full">Prediction</h2>
            {/* Prediction Chart */}
            <PredictionChart />
        </section>
    );
}