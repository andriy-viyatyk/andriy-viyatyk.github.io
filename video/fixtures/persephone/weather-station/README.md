# Weather Station

A hobby weather station: three outdoor sensors report temperature, humidity and wind every hour.
This repository holds the collector, the daily report and a dashboard board.

## Layout

| Folder | What is in it |
|---|---|
| `src/` | The collector and the daily report (TypeScript) |
| `data/` | Raw readings (`readings.csv`) and the station list (`stations.json`) |
| `docs/` | How the pieces fit together |
| `.persephone/boards/Station Dashboard/` | A Persephone board that charts the latest readings |

## Run

```bash
npm install
npm run collect   # poll the sensors once and append to data/readings.csv
npm run report    # print today's minimum, maximum and average per station
```
