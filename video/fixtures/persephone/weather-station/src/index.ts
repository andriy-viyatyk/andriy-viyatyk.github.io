import { readFile, appendFile } from "node:fs/promises";
import { readStation, type Reading, type Station } from "./sensors";
import { summarize } from "./report";

const stations: Station[] = JSON.parse(await readFile("data/stations.json", "utf8"));

async function collect() {
    for (const station of stations) {
        try {
            const r = await readStation(station);
            await appendFile("data/readings.csv", `${r.time},${r.station},${r.temperature},${r.humidity},${r.wind}\n`);
        } catch (error) {
            console.warn(`skipped ${station.id}:`, error);
        }
    }
}

async function report() {
    const [, ...rows] = (await readFile("data/readings.csv", "utf8")).trim().split("\n");
    const readings: Reading[] = rows.map((row) => {
        const [time, station, temperature, humidity, wind] = row.split(",");
        return { time, station, temperature: +temperature, humidity: +humidity, wind: +wind };
    });
    console.table(summarize(readings));
}

if (process.argv[2] === "collect") await collect();
else await report();
