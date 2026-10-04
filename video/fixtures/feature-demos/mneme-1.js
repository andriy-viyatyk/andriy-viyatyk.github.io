// Mneme demo, scene 1: turn Mneme on from quick settings; the Mneme page opens and loads the model.
// Needs a fresh session on the demo profile with no data/mneme folder (see mneme-reset.js).
const { sleep, vis, byText, rect } = __ws;
const ctl = document.querySelector('[data-name="window-recording-controls"]');
if (ctl) ctl.style.visibility = 'hidden';
window.__REC = window.__TAKE === true;
if (window.__REC) await app.window.screen.recording.start({ region: 'window' });
await sleep(1000);
const quick = vis('[data-name="header-snip-button"]');
await __ws.click(quick, { ms: 1100 });
await sleep(500);
const sw = vis('[data-name="header-quick-settings-mneme-enabled"]');
const row = sw.closest('[role=menuitem],[data-type=menu-item]') || sw.parentElement;
const menu = rect(row.parentElement);
const swRow = rect(row);
__demo.show({ x: menu.x, y: swRow.y - 2, w: menu.w, h: swRow.h + 4 }, 'Turn Mneme on', 'A local knowledge base: full-text and meaning-based search over your Markdown folders', 'left', 2);
await __demo.move(swRow.x + swRow.w - 30, swRow.y + swRow.h / 2, 900);
await sleep(3300);
__demo.hide();
await __ws.click(sw, { dx: 14 });
await sleep(700);
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
// The Mneme page opens by itself while no embedding model is downloaded yet.
for (let i = 0; i < 60 && !vis('[data-name="mneme-update-model"]'); i++) await sleep(250);
await sleep(1200);
const load = vis('[data-name="mneme-update-model"]');
const header = rect(load.parentElement);
__demo.show({ x: 0, y: header.y - 26, w: header.x + header.w + 4, h: 150 }, 'One-time model download', 'Semantic search needs a small embedding model (340 MB). Indexing and search then stay on your machine', 'below', 2);
await __demo.move(rect(load).x + 40, rect(load).y + rect(load).h / 2, 1000);
await sleep(4200);
__demo.hide();
await __ws.click(load, { dx: 40 });
// Show the progress bar for a moment, then pause the recording through the 15–40 s download.
// script.execute returns before a long wait ends, so the wait runs in the background and sets
// __m1done; run this scene with `--wait __m1done`. Scene 2 resumes the recording.
await sleep(2500);
if (window.__REC) await app.window.screen.recording.pause();
window.__m1done = false;
(async () => {
	// Done when the model line reads "ready" (it reads "not loaded" until the service has loaded it).
	for (let i = 0; i < 1200; i++) { await sleep(250); if (/· v1[^a-z]*ready/.test(document.body.innerText)) break; }
	await sleep(1000);
	window.__m1done = true;
})();
return 'scene 1 done; waiting for the model';
