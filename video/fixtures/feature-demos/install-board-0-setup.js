// Pre-take state (not recorded): one workspace tab on weather-station with docs/ expanded.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Windows separators, so the Explorer root reads C:\Demo\weather-station.
await app.pages.openFile(['C:', 'Demo', 'weather-station'].join(String.fromCharCode(92)));
await sleep(1500);
const ws = app.pages.all.at(-1);
for (const p of [...app.pages.all]) if (p.id !== ws.id) await app.pages.closePage(p.id);
await sleep(500);
await __ws.click(__ws.chevron('docs'), { ms: 300 });
await __demo.move(900, 600, 300);
return app.pages.all.map((p) => p.title);
