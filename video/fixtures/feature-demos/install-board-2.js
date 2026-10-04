// Scene 2: download from the catalog, register, trust.
window.__b2done = false;
const { sleep, vis, rect } = __ws;
const ed = vis('[data-name="board-info-editor"]');
const card = rect(ed.querySelector('[data-name="board-info-mask"]')?.closest('div[class]')?.parentElement ?? ed);
const dl = [...ed.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Download');
const d = rect(dl);
await __demo.move(d.x + 30, d.y + d.h / 2, 900);
__demo.show({ x: d.x - 220, y: d.y - 95, w: 940, h: 130 }, 'Word Viewer, from the board catalog', 'A checksum-verified download into your boards folder', 'below', 6);
await sleep(3800);
__demo.hide();
await sleep(300);
await __ws.click(dl, { dx: d.w / 2 });
const t0 = Date.now();
while (Date.now() - t0 < 30000 && !document.querySelector('[data-name="board-info-register"]')) await sleep(200);
await sleep(1200);
// Not awaited: the click resolves only after the trust dialog it opens is answered.
__ws.click(document.querySelector('[data-name="board-info-register"]'));
await sleep(1900);
const dialog = vis('[data-name="trust-board-dialog"]');
// The data-name sits on the full-window backdrop; ring the dialog panel instead.
let panel = dialog.querySelector('button');
while (panel && !(panel.getBoundingClientRect().width > 500 && panel.getBoundingClientRect().height > 200)) panel = panel.parentElement;
const dr = rect(panel && panel.getBoundingClientRect().width < window.innerWidth * 0.9 ? panel : dialog);
const trust = [...dialog.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Trust Board');
const tr = rect(trust);
await __demo.move(tr.x + tr.w / 2, tr.y + tr.h / 2, 900);
__demo.show(dr, 'You decide what it may do', 'A board runs only after you trust it, and only with the permissions it declares. This one asks for none', 'below', 4);
await sleep(4800);
__demo.hide();
await sleep(300);
await __ws.click(trust, { dx: tr.w / 2 });
await sleep(1800);
window.__b2done = true;
return app.pages.all.at(-1).editor?.id;
