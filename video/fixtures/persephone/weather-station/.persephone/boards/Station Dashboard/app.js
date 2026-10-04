// Renders the station cards and the hourly temperature chart from window.READINGS.
const stations = [["garden", "Garden", "#4caf50"], ["roof", "Roof", "#2196f3"], ["lake", "Lake shore", "#ff9800"]];
const rows = window.READINGS;

const cards = document.getElementById("cards");
for (const [id, name] of stations) {
    const last = rows.filter((r) => r[1] === id).at(-1);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h2>${name}</h2><div class="temp">${last[2].toFixed(1)}°</div>
        <div class="meta"><span>💧 ${last[3]}%</span><span>💨 ${last[4]} m/s</span></div>`;
    cards.append(card);
}

const svg = document.getElementById("chart");
const temps = rows.map((r) => r[2]);
const min = Math.floor(Math.min(...temps)) - 1;
const max = Math.ceil(Math.max(...temps)) + 1;
const x = (hour) => 10 + (hour / 23) * 700;
const y = (t) => 210 - ((t - min) / (max - min)) * 200;
for (let t = Math.ceil(min / 5) * 5; t <= max; t += 5) {
    svg.insertAdjacentHTML("beforeend", `<line x1="10" x2="710" y1="${y(t)}" y2="${y(t)}" stroke="currentColor" stroke-opacity=".15"/>`);
}
const legend = document.getElementById("legend");
for (const [id, name, color] of stations) {
    const points = rows.filter((r) => r[1] === id).map((r) => `${x(+r[0])},${y(r[2])}`).join(" ");
    svg.insertAdjacentHTML("beforeend", `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" vector-effect="non-scaling-stroke"/>`);
    legend.insertAdjacentHTML("beforeend", `<span><i style="background:${color}"></i>${name}</span>`);
}
