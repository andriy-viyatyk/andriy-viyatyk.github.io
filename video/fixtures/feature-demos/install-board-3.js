// Scene 3: the document in Word Viewer, then Tools & Editors → Boards; stop.
const { sleep, vis, rect, byText } = __ws;
const sw = vis('[data-name="page-editor-switch"]');
const word = [...sw.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Word');
await __ws.click(word, { dx: rect(word).w / 2 });
await sleep(2500);
const s = rect(vis('[data-name="page-editor-switch"]'));
await __demo.move(s.x + s.w * 0.6, s.y + s.h * 0.7, 800);
__demo.show(s, '.docx now opens in Word Viewer', 'Installed boards sit next to the built-in editors for their file types', 'below', 5);
await sleep(4200);
__demo.hide();
await __demo.move(800, 500, 900);
await sleep(1500);
await __ws.click(document.querySelector('[data-name="persephone-menu"]'), { ms: 1000 });
await sleep(500);
await __ws.click(byText(vis('[data-name="menubar-folders"]'), 'Tools & Editors'));
await sleep(700);
const content = vis('[data-name="menubar-content"]');
await __ws.click([...content.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Boards'));
await sleep(900);
const c = rect(content);
const tabs = rect([...content.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Boards').parentElement);
__demo.show({ x: c.x, y: tabs.y - 4, w: c.w, h: 150 }, 'Every board in one place', 'Tools & Editors lists built-in editors, your boards and tools', 'right', 4);
await __demo.move(c.x + 200, tabs.y + 110, 900);
await sleep(4500);
__demo.hide();
await sleep(1200);
if (window.__REC) {
	const result = await app.window.screen.recording.stop();
	for (const sel of ['[data-name="window-recording-controls"]', '[data-name="status-indicators"]']) { const e = document.querySelector(sel); if (e) e.style.visibility = ''; }
	app.window.menuBar.close();
	return result;
}
return 'done';
