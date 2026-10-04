// Scene 1: open a .docx with no viewer installed, then the "+" offer.
const { sleep, vis, rect, byText } = __ws;
for (const sel of ['[data-name="window-recording-controls"]', '[data-name="status-indicators"]']) { const e = document.querySelector(sel); if (e) e.style.visibility = 'hidden'; }
window.__REC = window.__TAKE === true;
if (window.__REC) await app.window.screen.recording.start({ region: 'window' });
await sleep(1000);
await __ws.click(__ws.explorerRow('september-report.docx'));
await sleep(1800);
const sw = vis('[data-name="page-editor-switch"]');
const plus = [...sw.querySelectorAll('button')].find((b) => b.textContent.trim() === '+');
const s = rect(sw);
await __demo.move(s.x + s.w - 14, s.y + s.h * 0.7, 900);
__demo.show(s, 'No viewer for .docx yet', 'Persephone opens it as a ZIP archive and offers an editor from the board catalog: +', 'below', 5);
await sleep(4200);
__demo.hide();
await sleep(300);
await __ws.click(plus, { dx: rect(plus).w / 2 });
await sleep(1500);
return app.pages.all.at(-1).editor?.id;
