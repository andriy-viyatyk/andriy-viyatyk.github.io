// Scene 1: Settings → Theme → Create a new theme.
const { sleep } = __te;
window.__REC = window.__TAKE === true;
document.querySelector('[data-name="settings-panels"]').scrollTop = 0;
if (window.__REC) await app.window.screen.recording.start({ region: 'window' });
await sleep(400);
const tiles = [...document.querySelectorAll('[aria-label^="Apply "][aria-label$=" theme"]')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getBoundingClientRect());
const plus = document.querySelector('[aria-label="Create a new theme"]');
const pr = plus.getBoundingClientRect();
const x0 = Math.min(...tiles.map((r) => r.x)), y0 = Math.min(...tiles.map((r) => r.y));
const grid = { x: x0, y: y0, w: Math.max(...tiles.map((r) => r.right)) - x0, h: pr.bottom - y0 };
await __demo.move(grid.x + grid.w * 0.6, grid.y + 120, 800);
__demo.show(grid, 'Themes live in Settings', 'Pick a built-in one, or make your own', 'right', 6);
await sleep(3500);
await __demo.move(pr.x + pr.width / 2, pr.y + pr.height / 2, 900);
__demo.show({ x: pr.x, y: pr.y, w: pr.width, h: pr.height }, 'Create a new theme', 'Opens the Theme Editor board, starting from the active theme', 'right', 6);
await sleep(3500);
__demo.hide();
await sleep(300);
await __ws.click(plus, { dx: pr.width / 2 });
const t0 = Date.now();
while (Date.now() - t0 < 20000) {
	const b = __te.board();
	if (b && await b.editor.evaluate(`document.querySelectorAll('.set-tile').length >= 100`).catch(() => false)) break;
	await sleep(200);
}
return 'scene 1 done';
