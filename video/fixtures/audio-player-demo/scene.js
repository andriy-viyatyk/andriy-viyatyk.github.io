// The Audio Player demo (persephone-audio-player-demo.mp4): one script.execute call in the capture
// window, a separate window (window.openNew) resized to 1120x720 that has the demo catalog
// C:\Demo\Music\demo.music.link.json open (make-music.py + demo.music.link.json in this folder).
// Needs scripts/demo-overlay.js installed first. window.__TAKE = true records; otherwise a dry run.
//
// Run it as: const AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
//            return await new AsyncFn('app', await app.fs.read('<this file>'))(app);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const board = app.pages.all.find((p) => p.title === 'demo.music.link.json');
const ev = (code) => board.editor.evaluate(code);

// Rect of a board element (CSS selector, optionally the one whose text starts with `text`), in window pixels.
async function boardRect(selector, text) {
	const r = await ev(`(() => {
		const all = [...document.querySelectorAll(${JSON.stringify(selector)})];
		const e = ${text ? `all.find((x) => x.textContent.trim().startsWith(${JSON.stringify(text)}))` : 'all[0]'};
		const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height };
	})()`);
	return __demo.toWindow('board', r);
}
async function clickPoint(x, y, ms = 700) {
	await __demo.move(x, y, ms);
	await __demo.ripple();
	await app.window.screen.clickAt({ x, y });
}
async function clickEl(selector, text, ms = 700) {
	const r = await boardRect(selector, text);
	await clickPoint(r.x + r.w / 2, r.y + r.h / 2, ms);
	return r;
}
const REST = [560, 600];   // where the agent cursor waits while the visualizer plays

// Prelude (not recorded): paused at 0:00 on the Bars effect, catalog panel open on Category, no list.
await ev(`(() => {
	const audio = document.querySelector('#audio'); audio.pause();
	const overlay = document.querySelector('#catalog-overlay'); if (!overlay.hidden) document.querySelector('#catalog-overlay-close').click();
	if (document.querySelector('#catalog-nav').hidden) document.querySelector('#catalog-toggle').click();
	const category = document.querySelector('[data-name=catalog-section-category]');
	if (category.getAttribute('aria-expanded') !== 'true') category.click();
	document.querySelector('[data-effect=bars]').click();
})()`);
await sleep(1200);

if (window.__TAKE) await app.window.screen.recording.start({ region: 'window', hideStatusChrome: true });
__demo.move(REST[0], REST[1], 10);
await sleep(1000);

// 1. The catalog: one JSON file the user owns.
const nav = await boardRect('#catalog-nav');
__demo.show(nav, 'Your music catalog', 'Categories, tags, artists and smart playlists, kept in one JSON file you own', 'right', 6);
await sleep(3800);
__demo.hide();
await sleep(300);

// 2. Browse a category and play a track.
await clickEl('#catalog-nav-list button', 'Electronic › Synthwave');
await sleep(1600);
await clickEl('#catalog-list .catalog-track', 'Night Drive');
await sleep(1200);
await clickEl('#catalog-overlay-close', null, 600);
await __demo.move(...REST, 800);
await sleep(1500);

// 3. Bars.
const picker = await boardRect('.effect-picker');
__demo.show(picker, 'Three visualizers', 'Bars, Circular and Instruments, all driven by the music', 'left', 6);
await sleep(3200);
__demo.hide();
await sleep(4000);

// 4. Circular, with the panel hidden.
await clickEl('#catalog-toggle', null, 700);
await sleep(300);
await clickEl('[data-effect=circular]', null, 900);
await __demo.move(...REST, 800);
await sleep(8000);

// 5. Instruments: the 3D sea, note lights in the sky, lightning on the kick.
await clickEl('[data-effect=instruments]', null, 700);
await __demo.move(...REST, 800);
await sleep(2500);
const view = await boardRect('#visualizer');
__demo.show({ x: view.x + view.w * 0.2, y: view.y + 40, w: view.w * 0.6, h: view.h * 0.32 }, 'Instruments', 'The beat lifts the sea, each note lights its own spot in the sky', 'below', 8);
await sleep(4000);
__demo.hide();
await sleep(10000);

// 6. Audio effects: equalizer, crossfade, gapless.
await clickEl('[data-name=audio-effects]', null, 800);
await sleep(3200);
await clickEl('[data-name=audio-effects]', null, 500);
await __demo.move(...REST, 800);
await sleep(4000);

// 7. End card.
__demo.show({ x: view.x + 12, y: view.y + 12, w: view.w - 24, h: view.h - 24 }, 'Audio Player — a board for Persephone', 'Install it free from the board catalog.', 'below', 0);
await sleep(4500);
__demo.hide();
await sleep(600);

const log = [`playing: ${await ev(`document.querySelector('#audio').currentSrc ? !document.querySelector('#audio').paused : 'no source'`)}`];
await ev(`document.querySelector('#audio').pause()`);
if (window.__TAKE) return { log, result: await app.window.screen.recording.stop() };
return { log };
