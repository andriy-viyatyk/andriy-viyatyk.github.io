import type { Reading } from "./sensors";

export interface DailySummary {
    station: string;
    min: number;
    max: number;
    average: number;
}

/** Minimum, maximum and average temperature per station. */
export function summarize(readings: Reading[]): DailySummary[] {
    const byStation = new Map<string, number[]>();
    for (const reading of readings) {
        const values = byStation.get(reading.station) ?? [];
        values.push(reading.temperature);
        byStation.set(reading.station, values);
    }
    return [...byStation].map(([station, values]) => ({
        station,
        min: Math.min(...values),
        max: Math.max(...values),
        average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
    }));
}
