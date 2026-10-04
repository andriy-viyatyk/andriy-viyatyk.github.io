// Demo overlay for screen recordings made with Persephone's own recorder
// (window.screen.recording). Persephone has no agent pointer yet, so this draws one: a cursor
// that glides and "clicks" (ripple), plus a ring with a dimmed spotlight and a tooltip card.
//
// It is plain DOM appended to the Persephone renderer of the CAPTURE window, so a full-window
// recording includes it. It is not app code and changes nothing in Persephone.
//
// How to use: paste this whole file as the code of
//   call path "script.execute", args [<this file>], windowIndex <capture window>
// It installs `window.__demo` and returns "installed". A renderer reload (hot reload, a main-process
// rebuild) wipes it — install it again right before the take.
//
// window.__demo:
//   appRect(selector)          → {x,y,w,h} of the first VISIBLE match in the app shell
//                                (hidden tabs keep copies of shell elements at 0x0)
//   toWindow(kind, rect)       → maps a rect read INSIDE a browser page (kind "browser", a <webview>)
//                                or a board (kind "board", an <iframe>) to window coordinates.
//                                Read the inner rect with pages[i].editor.evaluate(...getBoundingClientRect())
//   move(x, y, ms = 900)       → glide the cursor (await it)
//   ripple()                   → click ripple at the cursor (call twice for a double-click)
//   show(rect, title, note, place = "below" | "above" | "right" | "left", pad = 6)
//                              → ring + spotlight + tooltip card (clamped to the window)
//   hide()                     → remove ring and tooltip
//
// Colors are hardcoded on purpose: this is a recording prop, not Persephone UI.
document.getElementById('demo-layer')?.remove();
const layer = document.createElement('div');
layer.id = 'demo-layer';
layer.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:"Segoe UI",system-ui,sans-serif;';
layer.innerHTML = `<style>
#demo-layer .ring{position:absolute;border:3px solid #ffb02e;border-radius:10px;box-shadow:0 0 0 4000px rgba(5,8,16,.42),0 0 18px rgba(255,176,46,.8);opacity:0;transition:opacity .35s,left .5s,top .5s,width .5s,height .5s;}
#demo-layer .tip{position:absolute;max-width:400px;background:#0d1322;border:1px solid #33405e;border-left:6px solid #ffb02e;border-radius:12px;padding:14px 18px;box-shadow:0 18px 50px rgba(0,0,0,.55);opacity:0;transform:translateY(10px) scale(.94);transition:opacity .3s,transform .35s cubic-bezier(.2,1.4,.4,1);}
#demo-layer .tip.show{opacity:1;transform:none;}
#demo-layer .tip b{display:block;color:#fff;font-size:20px;font-weight:700;margin-bottom:4px;}
#demo-layer .tip span{display:block;color:#c3cbdc;font-size:15px;line-height:1.4;}
#demo-layer .cursor{position:absolute;left:0;top:0;width:30px;height:30px;transition:transform .9s cubic-bezier(.45,.05,.25,1);filter:drop-shadow(0 2px 3px rgba(0,0,0,.6));}
#demo-layer .ripple{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:3px solid #ffb02e;animation:demo-ripple .6s ease-out forwards;}
@keyframes demo-ripple{from{transform:scale(.4);opacity:1}to{transform:scale(3.4);opacity:0}}
</style><div class="ring"></div><div class="tip"><b></b><span></span></div>
<svg class="cursor" viewBox="0 0 24 24"><path d="M4 2l15 10.5-6.6 1.2 4 7.6-3 1.5-4-7.6L4 20z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
document.body.append(layer);
const ring = layer.querySelector('.ring');
const tip = layer.querySelector('.tip');
const cursor = layer.querySelector('.cursor');
let cx = window.innerWidth * 0.7;
let cy = window.innerHeight * 0.66;
cursor.style.transform = `translate(${cx}px,${cy}px)`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const guestOffset = (kind) => {
	const el = [...document.querySelectorAll(kind === 'board' ? 'iframe' : 'webview')].find((e) => e.getBoundingClientRect().width > 0);
	const r = el?.getBoundingClientRect();
	return r ? { x: r.x, y: r.y } : { x: 0, y: 0 };
};
window.__demo = {
	toWindow(kind, r) {
		const o = guestOffset(kind);
		return { x: r.x + o.x, y: r.y + o.y, w: r.w, h: r.h };
	},
	appRect(selector) {
		const el = [...document.querySelectorAll(selector)].find((x) => {
			const r = x.getBoundingClientRect();
			return r.width > 0 && r.height > 0;
		});
		if (!el) throw new Error(`not visible: ${selector}`);
		const r = el.getBoundingClientRect();
		return { x: r.x, y: r.y, w: r.width, h: r.height };
	},
	async move(x, y, ms = 900) {
		cursor.style.transition = `transform ${ms}ms cubic-bezier(.45,.05,.25,1)`;
		cursor.style.transform = `translate(${x - 4}px,${y - 2}px)`;
		cx = x;
		cy = y;
		await sleep(ms + 50);
	},
	async ripple() {
		const d = document.createElement('div');
		d.className = 'ripple';
		d.style.left = `${cx}px`;
		d.style.top = `${cy}px`;
		layer.append(d);
		setTimeout(() => d.remove(), 700);
		await sleep(250);
	},
	show(r, title, note, place = 'below', pad = 6) {
		Object.assign(ring.style, { left: `${r.x - pad}px`, top: `${r.y - pad}px`, width: `${r.w + pad * 2}px`, height: `${r.h + pad * 2}px`, opacity: '1' });
		tip.querySelector('b').textContent = title;
		tip.querySelector('span').textContent = note;
		tip.classList.remove('show');
		const W = window.innerWidth;
		const H = window.innerHeight;
		requestAnimationFrame(() => {
			const tw = tip.offsetWidth;
			const th = tip.offsetHeight;
			let x;
			let y;
			if (place === 'below') { x = r.x; y = r.y + r.h + pad + 16; }
			else if (place === 'above') { x = r.x; y = r.y - pad - 16 - th; }
			else if (place === 'right') { x = r.x + r.w + pad + 16; y = r.y; }
			else { x = r.x - pad - 16 - tw; y = r.y; }
			tip.style.left = `${Math.max(16, Math.min(W - tw - 16, x))}px`;
			tip.style.top = `${Math.max(16, Math.min(H - th - 16, y))}px`;
			tip.classList.add('show');
		});
	},
	hide() {
		ring.style.opacity = '0';
		tip.classList.remove('show');
	},
};
return 'installed';
