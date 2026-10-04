// The three scenes of the Torrent Viewer demo (persephone-torrent-demo.mp4), exactly as recorded.
// Each block is the code of ONE `script.execute` call in the capture window (windowIndex = the
// window from window.openNew). Run them back to back; scripts/demo-overlay.js must be installed
// first. A scene is split at a point where the screen holds still, because each MCP round trip
// adds 1–4 s of idle footage — fewer, longer scenes give a tighter clip.
//
// Renderer scripts can drive pages directly: app.pages.all[i].editor.evaluate / click work the
// same as the MCP paths pages[i].editor.*.

// ── Scene 1: the web page and the magnet link ────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Keep the recorder's own header controls out of the shot (restored after stop).
const ctl = document.querySelector('[data-name="window-recording-controls"]');
if (ctl) ctl.style.visibility = 'hidden';
// After a "Remove all" the next board tab shows a stale red "Torrent status unavailable ×" in its
// status bar (a Persephone bug). Dismiss it the instant it appears.
const dismiss = () => {
	const b = [...document.querySelectorAll('button[aria-label="Dismiss pipe error"]')].find((x) => x.getBoundingClientRect().width > 0);
	if (b) b.click();
};
window.__demoObs = new MutationObserver(dismiss);
window.__demoObs.observe(document.body, { subtree: true, childList: true, characterData: true });
const web = app.pages.all.find((p) => p.title === 'Open Movie Library');
await app.window.screen.recording.start({ region: 'window' });
await sleep(1200);
const m = __demo.toWindow('browser', await web.editor.evaluate(
	`(() => { const r=document.querySelector('#bbb-magnet').getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })()`));
await __demo.move(m.x + m.w * 0.55, m.y + m.h * 0.6, 1100);
__demo.show(m, 'Magnet links open in Persephone', 'The Torrent Viewer board handles magnet: links from any web page', 'right', 6);
await sleep(3800);
__demo.hide();
await sleep(300);
await __demo.ripple();
await web.editor.click('#bbb-magnet');
// Wait for the board tab and the file list (metadata arrives in ~1 s for this torrent).
const t0 = Date.now();
while (Date.now() - t0 < 20000) {
	const board = app.pages.all.find((p) => p.title === 'Torrent Viewer');
	if (board && await board.editor.evaluate(`!!document.querySelector('[aria-label="Torrent files"] [role=option]')`).catch(() => false)) break;
	await sleep(200);
}
return 'scene 1 done';

// ── Scene 2: torrent list, file list, open the file ──────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const board = app.pages.all.find((p) => p.title === 'Torrent Viewer');
await sleep(1500);
const g = await board.editor.evaluate(`(() => {
	const q = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; };
	return { t: q('[aria-label="Session torrents"] [role=option]'), files: q('[aria-label="Torrent files"]'),
		opts: [...document.querySelectorAll('[aria-label="Torrent files"] [role=option]')].map((o) => { const r = o.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; }) };
})()`);
// Ring the header plus the rows, not the whole (tall, empty) column.
const left = __demo.toWindow('board', { x: 0, y: 0, w: g.t.w, h: g.t.y + g.t.h });
const last = g.opts[g.opts.length - 1];
const right = __demo.toWindow('board', { x: g.files.x, y: 0, w: g.files.w, h: last.y + last.h });
const row = __demo.toWindow('board', g.opts[0]);
await __demo.move(left.x + 170, left.y + left.h - 8, 1000);
__demo.show(left, 'Your torrents', 'Each one with live download speed and peer count', 'below', 4);
await sleep(3600);
await __demo.move(right.x + 300, right.y + right.h - 6, 1000);
__demo.show(right, 'Files inside the torrent', 'Only the metadata is fetched; nothing downloads until you open a file', 'below', 4);
await sleep(3800);
await __demo.move(row.x + 90, row.y + row.h * 0.6, 800);
__demo.show(row, 'Open any file', "Videos, images and text open in Persephone's own editors; other formats in installed viewer boards", 'below', 4);
await sleep(4200);
__demo.hide();
await sleep(300);
await __demo.ripple();
await __demo.ripple();
// A single click only selects a file; a double-click (or Enter) opens it.
await board.editor.click('[aria-label="Torrent files"] [role=option]', { nth: 0, clickCount: 2 });
return 'scene 2 done';

// ── Scene 3: playback and the torrent status in the status bar, then stop ────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const video = () => [...document.querySelectorAll('video')].find((x) => x.getBoundingClientRect().width > 0);
const t0 = Date.now();
while (Date.now() - t0 < 15000) {
	const v = video();
	if (v && !v.paused && v.currentTime > 0.3) break;
	await sleep(200);
}
await __demo.move(1000, 600, 900);
await sleep(4500);
const s = __demo.appRect('[data-name="page-pipe-status"]');
await __demo.move(s.x - 26, s.y + 4, 1000);
__demo.show(s, 'Streams while it downloads', 'Peers and download speed, live in the status bar', 'above', 3);
await sleep(4500);
__demo.hide();
await __demo.move(1000, 600, 900);
await sleep(3500);
const result = await app.window.screen.recording.stop(); // { path, durationMs, width, height, ... }
window.__demoObs?.disconnect();
const ctl = document.querySelector('[data-name="window-recording-controls"]');
if (ctl) ctl.style.visibility = '';
return result;
