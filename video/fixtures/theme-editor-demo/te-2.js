// Scene 2: the generated set; a tile previews the whole app; the contrast list.
const { sleep } = __te;
await sleep(1200);
const area = await __te.rect('#set-tiles');
const view = { x: area.x, y: area.y, w: area.w, h: Math.min(area.h, window.innerHeight - area.y - 30) };
await __demo.move(view.x + view.w * 0.5, view.y + 160, 900);
__demo.show(view, '100 generated themes', 'Ranked by text contrast and sorted by hue. Click one to preview it', 'left', 4);
await sleep(4200);
__demo.hide();
// A light theme first (the most colorful light tile), then the most saturated dark blue one.
const light = await __te.pickTile((h, s, l) => (l > 0.82 ? s : -Infinity));
await __te.scrollTile(light);
await __te.click('.set-tile', { nth: light });
await sleep(700);
await __demo.move(window.innerWidth * 0.5, 30, 900);
__demo.show({ x: 4, y: 4, w: window.innerWidth - 8, h: window.innerHeight - 8 }, 'A live preview', 'The whole app recolors at once: tabs, toolbars, every editor', 'below', 0);
await sleep(3500);
__demo.hide();
const blue = await __te.pickTile((h, s, l) => (l < 0.3 && l > 0.1 && h >= 200 && h <= 240 ? s : l < 0.25 ? s - 1 : -Infinity));
await __te.scrollTile(blue);
await __te.click('.set-tile', { nth: blue });
await sleep(1800);
const c = await __te.rect('.contrast-panel');
await __demo.move(c.x + c.w * 0.75, c.y + c.h * 0.4, 900);
__demo.show(c, 'Contrast checked', 'Every text and background pair, against WCAG AA', 'right', 4);
await sleep(3800);
__demo.hide();
return 'scene 2 done';
