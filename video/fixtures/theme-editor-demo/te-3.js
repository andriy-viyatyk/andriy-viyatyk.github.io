// Scene 3: Generator (slide the background hue), Save as, the new theme in Settings; stop.
const { sleep } = __te;
await __te.click('#generator-tab');
await sleep(1200);
const block = await __te.rect('[data-name="generator-block-background"]');
await __demo.move(block.x + block.w * 0.5, block.y + 40, 900);
__demo.show(block, 'Fine-tune the base colors', 'Background, text and accent; every other color is derived from them', 'left', 4);
await sleep(3800);
__demo.hide();
// Drag the hue slider: the cursor follows the thumb while the value steps.
const sel = '[data-name="generator-background-h"]';
const sr = await __te.rect(sel);
const h0 = Number(await __te.board().editor.evaluate(`document.querySelector('${sel}').value`));
const thumbX = (v) => sr.x + 8 + (sr.w - 16) * v / 360;
await __demo.move(thumbX(h0), sr.y + sr.h / 2, 800);
await __demo.ripple();
const h1 = h0 - 25;
for (let k = 1; k <= 20; k++) {
	const v = Math.round(h0 + (h1 - h0) * k / 20);
	await __te.board().editor.evaluate(`(() => { const i = document.querySelector('${sel}'); i.value = ${v}; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
	await __demo.move(thumbX(v), sr.y + sr.h / 2, 50);
}
await sleep(1000);
// Save as → name → Save.
const saveAs = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Save as' && b.getBoundingClientRect().width > 0);
await __ws.click(saveAs, { dx: saveAs.getBoundingClientRect().width / 2 });
await sleep(900);
const name = 'Deep Ocean';
await __te.board().editor.evaluate(`(async () => { const i = document.querySelector('#rename-input'); i.value = '';
	for (const ch of ${JSON.stringify(name)}) { i.value += ch; i.dispatchEvent(new Event('input', { bubbles: true })); await new Promise((r) => setTimeout(r, 110)); } })()`);
await sleep(600);
await __te.click('#confirm-rename');
await sleep(1500);
// Back to Settings: the new theme has its own tile.
const tab = [...document.querySelectorAll('[data-name="page-tab"]')].find((t) => t.textContent.includes('Settings') && t.getBoundingClientRect().width > 0);
await __ws.click(tab, { dx: 40 });
await sleep(400);
const panels = document.querySelector('[data-name="settings-panels"]');
const custom = () => [...document.querySelectorAll('[aria-label="Apply ' + name + ' theme"]')].find((e) => e.getBoundingClientRect().width > 0);
const target = custom().getBoundingClientRect().bottom - window.innerHeight + 80;
const from = panels.scrollTop;
for (let k = 1; k <= 20; k++) { panels.scrollTop = from + (target - from) * k / 20; await sleep(30); }
await sleep(200);
const cr = custom().getBoundingClientRect();
await __demo.move(cr.x + cr.width / 2, cr.y + cr.height / 2, 900);
__demo.show({ x: cr.x, y: cr.y, w: cr.width, h: cr.height }, 'Saved as your own theme', 'Select it in Settings any time, or export it as JSON to share', 'right', 6);
await sleep(4500);
__demo.hide();
await sleep(1200);
let result = 'dry run';
if (window.__REC) result = await app.window.screen.recording.stop();
for (const s of ['[data-name="window-recording-controls"]', '[data-name="status-indicators"]']) { const e = document.querySelector(s); if (e) e.style.visibility = ''; }
return result;
