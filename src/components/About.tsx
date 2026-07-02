// About
"use client"

import React, { useId, useState } from 'react';
import { resetData, DATA } from "../utils/data";
import { Duplicates, MissingValues, Outliers, Transform, ConfigType } from '../utils/config';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { etl } from '../utils/etl';
import { forecast } from '../utils/forecast';
import { showError } from "../utils/alert";
import { ValidationError } from "@/errors/validation";

type CSVInputProps = {
    setHasData: React.Dispatch<React.SetStateAction<boolean>>
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    config: ConfigType
};

function CSVInput({ setHasData, loading, setLoading, config}: CSVInputProps) {
    const inputId = useId();

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const file = input.files?.[0];
        if (!file) return;

        setHasData(false);
        setLoading(true);

        const reader = new FileReader();

        reader.onload = () => {
            try {
                resetData();

                const text = reader.result as string;

                const rows = text
                    .split("\n")
                    .map(r => r.trim())
                    .filter(Boolean);

                const header = rows[0].split(",").map(h => h.trim());
                const xName = header[0];
                const yName = header[1];

                DATA.xName = xName;
                DATA.yName = yName;

                const parsed = rows.slice(1).map(line => {
                    const [dateStr, valueStr] = line.split(",");

                    return {
                        date: new Date(dateStr.trim()),
                        value: Number(valueStr.trim())
                    };
                });

                const x = parsed.map(p => p.date);
                const y = parsed.map(p => p.value);

                // Data size validation
                const minData = 50;
                const maxData = 10_000;
                if (y.length < minData || y.length > maxData) {
                    throw new ValidationError(
                        "Invalid CSV size",
                        `File must have between ${minData} and ${maxData} values.
                Current size: ${y.length}`
                    );
                }

                // Prepare Data
                DATA.config = config;

                // ETL and forecast
                etl(x, y);
                forecast(DATA.y);

                setHasData(true);
            } catch (err) {
                if (err instanceof ValidationError) {
                    showError(err.title, err.message);
                } else if (err instanceof Error) {
                    showError("Unexpected error", err.message);
                } else {
                    showError("Unexpected error", "Unknown error occurred");
                }
            } finally {
                setLoading(false);
                input.value = "";
            }
        };

        reader.readAsText(file);
    };

    return (
        <label
            htmlFor={loading ? undefined : inputId}
            className={`
                group inline-flex items-center justify-center
                w-48 h-48
                border-2 border-dashed
                rounded-2xl
                bg-neutral-500
                transition
                ${loading
                    ? "cursor-not-allowed opacity-60 border-blue-300"
                    : "cursor-pointer border-blue-200"
                }
            `}
            title={loading ? "Processing..." : "Upload CSV"}
        >
            <FontAwesomeIcon
                icon={loading ? faSpinner : faArrowDown}
                size="2xl"
                className={`
                    transition-colors duration-300
                    ${loading
                        ? "text-blue-300 animate-spin"
                        : "text-neutral-700 group-hover:text-white group-hover:animate-bounce"
                    }
                `}
            />
            <input id={inputId} type="file" accept=".csv" className="hidden" onChange={handleFile} disabled={loading} />
        </label>
    );
}

type AboutProps = {
    setHasData: React.Dispatch<React.SetStateAction<boolean>>
    config: ConfigType;
    setConfig: React.Dispatch<React.SetStateAction<ConfigType>>
};

export default function About({ setHasData, config, setConfig }: AboutProps) {
    const [loading, setLoading] = useState(false);

    function handleChange<K extends keyof ConfigType>(key: K, value: ConfigType[K]) {
        setConfig(prev => ({ ...prev, [key]: value }));
    }

    type FieldProps = {
        label: string;
        children: React.ReactNode;
    };

    function Field({ label, children }: FieldProps ) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-lg text-zinc-400 w-36 text-left my-3">
                    {label}
                </span>
                <div className="flex items-center text-lg h-9 ml-auto">
                    {children}
                </div>
            </div>
        );
    }

    type Primitive = string | number;
    type ConfigSelectProps<T extends Primitive> = {
        value: T;
        onChange: (value: T) => void
        options: readonly T[] | Record<string, T>;
        highlight?: T;
    };

    function ConfigSelect<T extends Primitive>({
        value, onChange, options, highlight
    }: ConfigSelectProps<T>) {
        return (
            <select
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
            <h1 className="text-6xl font-semibold mt-24 mb-12">Welcome to ARIMA Analyser!</h1>
            <h2 className="text-3xl mb-24">
                An interactive tool for time series analysis and forecasting based on classical statistical models.
            </h2>
            <div className="flex justify-center gap-12">
                {/* ETL */}
                <div className="w-150 px-4 py-4 border rounded-xl bg-bg-third">
                    <p className="text-4xl font-semibold mb-4">Data Treatment</p>
                    <p className="text-2xl mb-8">Update your information.</p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-2xl mx-auto">
                        {/* Missing Values */}
                        <Field label="Missing Values">
                            <ConfigSelect
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
                                value={config.outliers}
                                onChange={v => handleChange('outliers', v)}
                                options={[
                                    Outliers.NONE, Outliers.SET_MEDIAN, Outliers.IQR_SET_MEDIAN,
                                    Outliers.IQR_CLAMP, Outliers.ZSCORE_CLAMP
                                ]}
                                highlight={Outliers.NONE}
                            />
                        </Field>
                        {/* Transform */}
                        <Field label="Transform">
                            <ConfigSelect
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
                <div className="w-80 px-4 py-4 border rounded-xl bg-bg-third">
                    <p className="text-4xl font-semibold mb-4">Data Injector</p>
                    <p className="text-2xl mb-4">Insert your CSV below.</p>
                    <CSVInput
                        setHasData={setHasData}
                        setLoading={setLoading}
                        loading={loading}
                        config={config}
                    />
                </div>
                {/* Config */}
                <div className="w-150 px-4 py-4 border rounded-xl bg-bg-third">
                    <p className="text-4xl font-semibold mb-4">Model Settings</p>
                    <p className="text-2xl mb-4">Configure analysis behavior.</p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-2xl mx-auto">
                        {/* Split Size */}
                        <Field label="Split-Size">
                            <ConfigSelect
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
                                value={config.precision}
                                onChange={v => handleChange('precision', v)}
                                options={[1, 2, 3, 4, 5, 6]}
                                highlight={2}
                            />
                        </Field>
                        {/* Lag Amount */}
                        <Field label="Lag Amount">
                            <ConfigSelect
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