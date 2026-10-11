// Theme Editor demo: board helpers (window.__te). Install after scripts/demo-overlay.js and
// fixtures/feature-demos/helpers.js, before the take. Run every file in the capture window.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const sel of ['[data-name="window-recording-controls"]', '[data-name="status-indicators"]']) {
	const e = document.querySelector(sel);
	if (e) e.style.visibility = 'hidden';
}
const board = () => app.pages.all.find((p) => p.title === 'Theme Editor');
window.__te = {
	sleep,
	board,
	// Window rect of the nth match inside the board.
	async rect(sel, nth = 0) {
		const r = await board().editor.evaluate(`(() => { const e = document.querySelectorAll(${JSON.stringify(sel)})[${nth}]; const b = e.getBoundingClientRect(); return {x:b.x,y:b.y,w:b.width,h:b.height}; })()`);
		return __demo.toWindow('board', r);
	},
	// Glide the overlay cursor onto a board element, ripple, then click it.
	async click(sel, { nth = 0, dx, ms = 800 } = {}) {
		const r = await __te.rect(sel, nth);
		await __demo.move(r.x + (dx ?? r.w / 2), r.y + r.h / 2, ms);
		await __demo.ripple();
		await board().editor.click(sel, { nth });
	},
	// Index of the generated tile whose background scores highest with score(h, s, l)
	// (0-360, 0-1, 0-1); -1 when every score is -Infinity.
	async pickTile(score) {
		return board().editor.evaluate(`(() => {
			const hsl = (hex) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
				const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
				if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1));
				const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, s, l]; };
			const score = ${score.toString()};
			let best = -1, top = -Infinity;
			document.querySelectorAll('.set-tile').forEach((t, i) => { const v = score(...hsl(t.querySelector('.mini-window').style.getPropertyValue('--tile-bg').trim())); if (v > top) { top = v; best = i; } });
			return best;
		})()`);
	},
	async scrollTile(i) {
		await board().editor.evaluate(`document.querySelectorAll('.set-tile')[${i}].scrollIntoView({ behavior: 'smooth', block: 'center' })`);
		await sleep(900);
	},
};
return 'te helpers installed';
