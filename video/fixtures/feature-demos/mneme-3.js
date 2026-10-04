// Mneme demo, scene 3: search by meaning, open the hit, then stop the recording.
const { sleep, vis, byText, rect } = __ws;
window.__m3done = false;
await app.window.screen.hover('[data-name="app-header"]', { position: { x: 700, y: 20 }, force: true }).catch(() => {});
await sleep(300);
const box = vis('[data-name="mneme-search-input"]');
const bar = rect(box.parentElement);
__demo.show({ x: rect(box).x - 4, y: bar.y - 2, w: 1296 - rect(box).x, h: bar.h + 4 }, 'Ask in your own words', 'Hybrid search matches exact terms and meaning, so a note is found even when it uses other words', 'below', 2);
await __demo.move(rect(box).x + 160, rect(box).y + rect(box).h / 2, 1000);
await sleep(3600);
__demo.hide();
await __demo.ripple();
await app.window.screen.type('[data-name="mneme-search-input"]', 'why does one station read too warm at night?', { slowly: true, submit: true });
// The first query also warms up the embedding model, so results can take a few seconds.
let hit;
for (let i = 0; i < 80 && !(hit = [...document.querySelectorAll('h3 a')].find((a) => a.textContent.trim() === 'Rooftop station' && a.getBoundingClientRect().width > 0)); i++) await sleep(250);
await sleep(800);
let block = hit;
while (block.parentElement && rect(block).h < 60) block = block.parentElement;
__demo.show(rect(block), 'The right note, first', '"Warmer after sunset" matched "too warm at night": the chimney was storing heat', 'below', 4);
await __demo.move(rect(hit).x + 50, rect(hit).y + rect(hit).h / 2, 1000);
await sleep(4800);
__demo.hide();
await __ws.click(hit, { dx: 50 });
await sleep(2500);
await __demo.move(900, 700, 1000);
await sleep(2500);
// Run with `--wait __m3done`; the recording's temp path ends up in window.__m3result.
if (window.__REC) {
	window.__m3result = await app.window.screen.recording.stop();
	const ctl = document.querySelector('[data-name="window-recording-controls"]');
	if (ctl) ctl.style.visibility = '';
}
window.__m3done = true;
return window.__m3result || app.pages.all.map((p) => p.title);
