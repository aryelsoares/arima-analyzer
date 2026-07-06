// CSV Input
"use client";

import React, { useId } from 'react';
import { resetData, DATA } from "../utils/data";
import { ConfigType } from '../utils/config';
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

export function CSVInput({ setHasData, loading, setLoading, config}: CSVInputProps) {
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

                let baseName = file.name.replace(/\.csv$/i, "");
                const charAmount = 30;

                if (baseName.length > charAmount) {
                    baseName = baseName.slice(0, charAmount) + "...";
                }

                DATA.fileName = baseName;

                const text = reader.result as string;

                const rows = text
                    .split("\n")
                    .map(r => r.trim())
                    .filter(Boolean);

                const header = rows[0].split(",").map(h => h.trim());
                const xName = header[0];
                const yName = header[1];

                const sanitizeName = (s: string) => s.replace(/['"]/g, "").trim();
                DATA.xName = sanitizeName(xName);
                DATA.yName = sanitizeName(yName);

                const parsed = rows.slice(1).map(line => {
                    const [dateStr, valueStr] = line.split(",");

                    const trimmed = valueStr?.trim();

                    return {
                        date: new Date(dateStr.trim()),
                        value:
                            trimmed === "" || trimmed == undefined
                                ? NaN
                                : Number(trimmed)
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
                DATA.fileName = "";

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