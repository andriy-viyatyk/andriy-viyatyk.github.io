const { sleep, vis, rect, byText } = __ws;
await __ws.click(vis('[data-name="explorer-boards"]'));
await sleep(900);
const bv = rect(vis('[data-name="boards-secondary-view"]'));
await __demo.move(bv.x + 200, bv.y + 100, 800);
__demo.show({ x: bv.x, y: bv.y, w: bv.w, h: 110 }, 'Boards that belong to the project', 'Small apps your agent builds for this folder live in .persephone/boards and travel with it', 'right', 4);
await sleep(4200);
__demo.hide();
await sleep(300);
await __ws.click(byText(vis('[data-name="boards-secondary-view"]'), 'Station Dashboard'));
await sleep(2500);
await __demo.move(900, 700, 1000);
await sleep(3000);
if (window.__REC) {
	const result = await app.window.screen.recording.stop();
	for (const sel of ['[data-name="window-recording-controls"]', '[data-name="status-indicators"]']) { const e = document.querySelector(sel); if (e) e.style.visibility = ''; }
	return result;
}
return app.pages.all.map(p => p.title);
