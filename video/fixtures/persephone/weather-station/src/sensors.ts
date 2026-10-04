export interface Reading {
    time: string;
    station: string;
    temperature: number;
    humidity: number;
    wind: number;
}

export interface Station {
    id: string;
    name: string;
    url: string;
}

/** Ask one station for its current values. Stations answer with plain JSON. */
export async function readStation(station: Station): Promise<Reading> {
    const response = await fetch(`${station.url}/now`);
    if (!response.ok) throw new Error(`${station.id}: HTTP ${response.status}`);
    const body = await response.json();
    return {
        time: new Date().toISOString(),
        station: station.id,
        temperature: Number(body.t),
        humidity: Number(body.h),
        wind: Number(body.w),
    };
}
