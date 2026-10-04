// Workspace demo helpers (window.__ws). Install after demo-overlay.js, before the take.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vis = (sel, root = document) => [...root.querySelectorAll(sel)].find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
const byText = (root, text) => [...root.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === text && e.getBoundingClientRect().width > 0);
const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
window.__ws = {
	sleep, vis, byText, rect,
	// Glide the overlay cursor to the element, ripple, then a trusted click on it.
	async click(el, { count = 1, dx, ms = 800 } = {}) {
		const r = rect(el);
		await __demo.move(r.x + (dx ?? Math.min(24, r.w / 2)), r.y + r.h / 2, ms);
		for (let i = 0; i < count; i++) await __demo.ripple();
		document.querySelectorAll('[data-demo-t]').forEach((e) => e.removeAttribute('data-demo-t'));
		el.setAttribute('data-demo-t', '1');
		await app.window.screen.click('[data-demo-t="1"]', { clickCount: count, position: { x: dx ?? Math.min(24, r.w / 2), y: r.h / 2 } });
		el.removeAttribute('data-demo-t');
		// Park the real (invisible) pointer so hover tooltips do not cover the next target.
		await app.window.screen.hover('[data-name="app-header"]', { position: { x: 700, y: 20 }, force: true }).catch(() => {});
	},
	explorerRow: (name) => byText(vis('[data-name="explorer"]'), name),
	chevron: (name) => byText(vis('[data-name="explorer"]'), name).closest('[role=treeitem]').querySelector('.tree-chevron'),
};
// Privacy mask: the Windows user name appears in AppData paths (install location, trust dialog,
// Tools & Editors). Show it as "demo" in every text node and title, before the frame paints.
// Built without backslash literals: "(Users\\)[^\\]+(\\AppData)" as a RegExp source.
const bs2 = String.fromCharCode(92, 92);
const userPath = new RegExp('(Users' + bs2 + ')[^' + bs2 + ']+(' + bs2 + 'AppData)', 'g');
const maskText = (v) => v.replace(userPath, '$1demo$2');
const fixNode = (n) => { const v = maskText(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; };
const fixTree = (root) => {
	const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	for (let n = w.nextNode(); n; n = w.nextNode()) fixNode(n);
	root.querySelectorAll?.('[title]').forEach((e) => { const v = maskText(e.title); if (v !== e.title) e.title = v; });
};
window.__mask?.disconnect();
fixTree(document.body);
window.__mask = new MutationObserver((records) => {
	for (const r of records) {
		if (r.type === 'characterData') fixNode(r.target);
		else if (r.type === 'attributes') { const v = maskText(r.target.title); if (v !== r.target.title) r.target.title = v; }
		else r.addedNodes.forEach((n) => (n.nodeType === 3 ? fixNode(n) : n.nodeType === 1 && fixTree(n)));
	}
});
window.__mask.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['title'] });
return 'ws helpers installed';
