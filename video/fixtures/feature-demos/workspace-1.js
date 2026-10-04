const { sleep, vis, byText, rect } = __ws;
for (const sel of ['[data-name="window-recording-controls"]', '[data-name="status-indicators"]']) { const e = document.querySelector(sel); if (e) e.style.visibility = 'hidden'; }
window.__REC = window.__TAKE === true;
if (window.__REC) await app.window.screen.recording.start({ region: 'window' });
await sleep(1000);
await __ws.click(document.querySelector('[data-name="persephone-menu"]'), { ms: 1000 });
await sleep(500);
await __ws.click(byText(vis('[data-name="menubar-folders"]'), 'Projects'));
await sleep(400);
const content = rect(vis('[data-name="menubar-content"]'));
const tree = { x: content.x, y: content.y, w: content.w, h: 112 };
__demo.show(tree, 'Your project folders', 'Pin any folder to the menu; double-click a project to open it as a workspace tab', 'below', 6);
await sleep(3500);
__demo.hide();
await sleep(300);
await __ws.click(byText(vis('[data-name="menubar-content"]'), 'weather-station'), { count: 2 });
await sleep(1200);
return app.pages.all.map(p => p.title);
