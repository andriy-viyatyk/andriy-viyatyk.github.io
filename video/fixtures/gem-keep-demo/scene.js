// The Gem Keep demo (persephone-gem-keep-demo.mp4): one script.execute call in the capture window,
// a board-mode window opened with boards.openBoardWindow(<gem-keep root>) and resized to 1040x650.
// Needs scripts/demo-overlay.js installed first and Green Meadow freshly started on Easy
// (the level's start screen, nothing built). window.__TAKE = true records; otherwise a dry run.
//
// Run it as: const AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
//            return await new AsyncFn('app', await app.fs.read('<this file>'))(app);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const board = app.pages.all.find((p) => p.title === 'Gem Keep');
const ev = (code) => board.editor.evaluate(code);

// Pads and road points of Green Meadow at the level's starting camera, in window CSS pixels.
// The camera is first zoomed in one wheel step (see the prelude below).
const PAD = { inner: [509, 324], upper: [470, 256], right: [658, 336], lower: [468, 412], east: [758, 430], south: [620, 460], top: [554, 227] };
const VAULT = { x: 752, y: 572, w: 62, h: 56 };
const ROAD = [424, 264];   // the first bend after the portal, where a fresh wave bunches up

async function boardRect(selector) {
	const r = await ev(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
	return __demo.toWindow('board', r);
}
async function clickPoint(x, y, ms = 700) {
	await __demo.move(x, y, ms);
	await __demo.ripple();
	await app.window.screen.clickAt({ x, y });
}
async function clickEl(selector, ms = 600) {
	const r = await boardRect(selector);
	await clickPoint(r.x + r.w / 2, r.y + r.h / 2, ms);
}
async function build(pad, type) {
	await clickPoint(...PAD[pad]);
	await sleep(450);
	await clickEl(`#build-panel [data-type=${type}]`);
	await sleep(350);
}
async function upgrade(pad) {
	await clickPoint(...PAD[pad]);
	await sleep(700);
	await clickEl('[data-name=upgrade-tower]');
	await sleep(900);
	await app.window.screen.clickAt({ x: PAD[pad][0], y: PAD[pad][1] });   // a second click on the pad closes its panel
}
// Zooms the camera with wheel steps at a canvas point (board coordinates).
async function zoom(steps, x, y) {
	for (let i = 0; i < Math.abs(steps); i++) {
		await ev(`document.querySelector('#view').dispatchEvent(new WheelEvent('wheel', { deltaY: ${steps < 0 ? -100 : 100}, clientX: ${x}, clientY: ${y}, bubbles: true, cancelable: true }))`);
		await sleep(70);
	}
}

// Prelude (not recorded): a fresh level at 1x speed, the camera one wheel step closer.
await ev(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); document.querySelector('#restart').click()`);
await sleep(2500);
while (await ev(`document.querySelector('#speed').textContent`) !== '1×') await ev(`document.querySelector('#speed').click()`);
await zoom(-1, 520, 330);
await sleep(1200);

if (window.__TAKE) await app.window.screen.recording.start({ region: 'window', hideStatusChrome: true });
__demo.move(980, 640, 10);
await sleep(1000);

// 1. The vault and the idea.
__demo.show(VAULT, 'Guard the gem vault', 'Raiders walk the road, steal your gems and carry them back to their portal', 'left', 8);
await sleep(3600);
__demo.hide();
await sleep(300);

// 2. Build the first towers.
await build('inner', 'bolt');
await build('right', 'mortar');
await build('lower', 'bolt');

// 3. Two waves at once, at double speed.
await clickEl('[data-name=start-wave]');
await sleep(400);
await clickEl('[data-name=speed]');
await sleep(2500);
await clickEl('[data-name=start-wave]');
await __demo.move(990, 640, 800);
await sleep(2500);

// 4. A closer look at the raiders and towers.
await zoom(-3, 470, 300);
await sleep(5500);
await zoom(3, 470, 300);
await sleep(600);

// 5. Spend the bounty: a frost tower, call the next wave and drop a meteor on it.
await build('upper', 'frost');
await clickEl('[data-name=start-wave]');
await sleep(2200);
const log = [];
log.push(`gold before meteor ${await ev(`document.querySelector('#gold').textContent`)}, mana ${await ev(`document.querySelector('#mana-fill').style.width`)}`);
await clickEl('[data-name=meteor]');
await sleep(250);
await clickPoint(...ROAD, 500);
log.push(`mana after meteor ${await ev(`document.querySelector('#mana-fill').style.width`)}`);
await __demo.move(990, 640, 800);
await sleep(4000);

// 6. Upgrade a bolt tower.
await upgrade('inner');
await __demo.move(990, 640, 800);
await sleep(4000);

// 7. End card.
const view = await boardRect('#view');
__demo.show({ x: view.x + 12, y: view.y + 12, w: view.w - 24, h: view.h - 24 }, 'Gem Keep — a board for Persephone', 'A 3D tower defense game in a Persephone tab. Install it free from the board catalog.', 'below', 0);
await sleep(4500);
__demo.hide();
await sleep(600);

if (window.__TAKE) return { log, result: await app.window.screen.recording.stop() };
return { log };
