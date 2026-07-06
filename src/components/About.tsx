// About
"use client";

import React, { useState } from 'react';
import { Duplicates, MissingValues, Outliers, Transform, ConfigType } from '../utils/config';
import { CSVInput } from "@/components/Input";
import { DATA } from "@/utils/data";

type AboutProps = {
    setHasData: React.Dispatch<React.SetStateAction<boolean>>
    config: ConfigType;
    setConfig: React.Dispatch<React.SetStateAction<ConfigType>>
};

export default function About({ setHasData, config, setConfig }: AboutProps) {
    const [loading, setLoading] = useState(false);
    const hasFile = DATA.fileName !== "";

    function handleChange<K extends keyof ConfigType>(key: K, value: ConfigType[K]) {
        setConfig(prev => ({ ...prev, [key]: value }));
    }

    type FieldProps = {
        label: string;
        children: React.ReactNode;
    };

    function Field({ label, children }: FieldProps ) {
        return (
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="text-[10px] lg:text-lg text-zinc-400 w-auto text-left my-3">
                    {label}
                </span>
                <div className="flex items-center text-[10px] lg:text-lg h-9 ml-auto">
                    {children}
                </div>
            </div>
        );
    }

    type Primitive = string | number;
    type ConfigSelectProps<T extends Primitive> = {
        id: string;
        value: T;
        onChange: (value: T) => void
        options: readonly T[] | Record<string, T>;
        highlight?: T;
    };

    function ConfigSelect<T extends Primitive>({
        id, value, onChange, options, highlight
    }: ConfigSelectProps<T>) {
        return (
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(
                    typeof value === 'number'
                        ? (Number(e.target.value) as T)
                        : (e.target.value as T)
                )}
                className={`
                    flex items-center h-9 px-3 border border-zinc-700 rounded-lg
                    ${loading ? "bg-zinc-400" : "bg-zinc-800"}
                    `}>
                    {Array.isArray(options)
                        ? options.map(opt => (
                            <option key={String(opt)} value={opt} className={opt === highlight ? "font-semibold" : ""}>
                                {opt}
                            </option>
                        ))
                        : Object.entries(options).map(([label, val]) => (
                            <option key={label} value={val} className={val === highlight ? "font-semibold" : ""}>
                                {label}
                            </option>
                        ))
                    }
                disabled={loading}
            </select>
        );
    }

    return (
        <section className="w-full text-center">
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-12">
                Welcome to <span className="text-blue-100">ARIMA Analyser!</span>
            </h1>

            {/* Description */}
            <h2 className="text-lg sm:text-2xl md:text-3xl mb-8 mx-12">
                An interactive tool for time series analysis and forecasting based on univariate ARIMA models.
            </h2>

            {/* Helper */}
            <p className="text-lg sm:text-2xl md:text-3xl mb-24 mx-12">
                New here? Check the documentation on{" "}
                <a
                    href="https://github.com/aryelsoares/arima-analyzer/wiki"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-200 underline hover:text-blue-100"
                >
                    GitHub
                </a>{" "}
                to learn how it works.
            </p>

            {/* Source file */}
            <p className="text-2xl sm:text-3xl mb-12">
                Source file: <strong className="text-amber-50">
                    { hasFile ? DATA.fileName : "None" }
                </strong>
            </p>

            {/* Features */}
            <div className="flex justify-center gap-12">
                {/* ETL */}
                <div className="w-80 lg:w-150 flex flex-col justify-center lg:block px-4 py-4 border rounded-xl bg-bg-third">
                    <p className="text-2xl sm:text-3xl lg:text-4xl text-blue-200 font-semibold mb-4">Data Treatment</p>
                    <p className="text-[10px] sm:text-lg lg:text-2xl mb-8">Improves dataset readability</p>

                    <div className="grid lg:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl mx-auto">
                        {/* Missing Values */}
                        <Field label="Missing Values">
                            <ConfigSelect
                                id={"config-missingValues"}
                                value={config.missingValues}
                                onChange={v => handleChange('missingValues', v)}
                                options={[
                                    MissingValues.FORWARD_FILL, MissingValues.BACKWARD_FILL,
                                    MissingValues.AVERAGE, MissingValues.MEDIAN, MissingValues.INTERPOLATE
                                ]}
                                highlight={MissingValues.AVERAGE}
                            />
                        </Field>
                        {/* Duplicate */}
                        <Field label="Duplication">
                            <ConfigSelect
                                id={"config-duplicates"}
                                value={config.duplicates}
                                onChange={v => handleChange('duplicates', v)}
                                options={[
                                    Duplicates.KEEP_FIRST, Duplicates.KEEP_LAST,
                                    Duplicates.AVERAGE, Duplicates.SUM
                                ]}
                                highlight={Duplicates.KEEP_FIRST}
                            />
                        </Field>
                        {/* Outliers */}
                        <Field label="Outliers">
                            <ConfigSelect
                                id={"config-outliers"}
                                value={config.outliers}
                                onChange={v => handleChange('outliers', v)}
                                options={[
                                    Outliers.NONE, Outliers.IQR_SET_MEDIAN,
                                    Outliers.IQR_CLAMP, Outliers.ZSCORE_CLAMP
                                ]}
                                highlight={Outliers.NONE}
                            />
                        </Field>
                        {/* Transform */}
                        <Field label="Transform">
                            <ConfigSelect
                                id={"config-transform"}
                                value={config.transform}
                                onChange={v => handleChange('transform', v)}
                                options={[
                                    Transform.NONE, Transform.LOG, Transform.MIN_MAX
                                ]}
                                highlight={Transform.NONE}
                            />
                        </Field>
                    </div>
                </div>
                {/* Input */}
                <div className="w-80 flex flex-col items-center justify-center lg:block px-4 py-4 md:border rounded-xl md:bg-bg-third">
                    <p className="text-2xl sm:text-3xl md:text-4xl text-blue-200 font-semibold mb-4">Data Injector</p>
                    <p className="text-[10px] sm:text-lg md:text-2xl mb-4">Insert your CSV below.</p>
                    <CSVInput
                        setHasData={setHasData}
                        setLoading={setLoading}
                        loading={loading}
                        config={config}
                    />
                </div>
                {/* Config */}
                <div className="w-80 lg:w-150 flex flex-col justify-center lg:block px-4 py-4 border rounded-xl bg-bg-third">
                    <p className="text-2xl sm:text-3xl lg:text-4xl text-blue-200 font-semibold mb-4">Model Settings</p>
                    <p className="text-[10px] sm:text-lg lg:text-2xl mb-4">Configure analysis behavior.</p>

                    <div className="grid lg:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl mx-auto">
                        {/* Split Size */}
                        <Field label="Split-Size">
                            <ConfigSelect
                                id={"config-splitSize"}
                                value={config.splitSize}
                                onChange={v => handleChange('splitSize', v)}
                                options={{
                                    "60%": 0.6, "65%": 0.65, "70%": 0.7, "75%": 0.75,
                                    "80%": 0.8, "85%": 0.85, "90%": 0.9
                                }}
                                highlight={0.8}
                            />
                        </Field>
                        {/* Precision */}
                        <Field label="Precision">
                            <ConfigSelect
                                id={"config-precision"}
                                value={config.precision}
                                onChange={v => handleChange('precision', v)}
                                options={[1, 2, 3, 4, 5, 6]}
                                highlight={2}
                            />
                        </Field>
                        {/* Lag Amount */}
                        <Field label="Lag Amount">
                            <ConfigSelect
                                id={"config-lagAmount"}
                                value={config.lagAmount}
                                onChange={v => handleChange('lagAmount', v)}
                                options={{
                                    Low: 10, Medium: 20, High: 30
                                }}
                                highlight={20}
                            />
                        </Field>
                        {/* Significance */}
                        <Field label="Significance">
                            <ConfigSelect
                                id={"config-significance"}
                                value={config.significance}
                                onChange={v => handleChange('significance', v)}
                                options={{
                                    Low: 0.01, Medium: 0.05, High: 0.10
                                }}
                                highlight={0.05}
                            />
                        </Field>
                        {/* Stationary Score */}
                        <Field label="Stationary Score">
                            <ConfigSelect
                                id={"config-stationaryScore"}
                                value={config.stationaryScore}
                                onChange={v => handleChange('stationaryScore', v)}
                                options={{
                                    Low: 0.3, Medium: 0.5, High: 0.7
                                }}
                                highlight={0.5}
                            />
                        </Field>
                        {/* Seasonal Score */}
                        <Field label="Seasonal Score">
                            <ConfigSelect
                                id={"config-seasonalScore"}
                                value={config.seasonalScore}
                                onChange={v => handleChange('seasonalScore', v)}
                                options={{
                                    Low: 0.3, Medium: 0.5, High: 0.7
                                }}
                                highlight={0.5}
                            />
                        </Field>
                    </div>
                </div>
            </div>
        </section>
    );
}