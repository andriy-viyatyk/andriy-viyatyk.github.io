const { sleep, vis, rect, byText } = __ws;
await __ws.click(vis('[data-name="explorer-search"]'));
await sleep(700);
const input = vis('[data-name="search-secondary-view"] input[placeholder="Search..."]');
await __ws.click(input);
input.setAttribute('data-demo-t', 'q');
await app.window.screen.type('[data-demo-t="q"]', 'temperature', { slowly: true, submit: true });
input.removeAttribute('data-demo-t');
await sleep(1500);
const sv = rect(vis('[data-name="search-secondary-view"]'));
await __demo.move(sv.x + sv.w * 0.7, sv.y + 260, 800);
__demo.show({ x: sv.x, y: sv.y, w: sv.w, h: 560 }, 'Search the whole project', 'Every match, grouped by file. Click one to jump to the line', 'right', 4);
await sleep(3800);
__demo.hide();
await sleep(300);
const hit = [...vis('[data-name="search-secondary-view"]').querySelectorAll('*')]
	.filter(e => e.textContent.includes('values.push') && e.getBoundingClientRect().width > 0)
	.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height)
	.map(e => e.closest('[data-row]') ?? e)[0];
await __ws.click(hit, { dx: 60 });
await sleep(700);
// Work around a reveal-before-layout bug: the match lands under the sticky-scroll header.
app.pages.all.at(-1).editor?.revealLine?.(15);
await sleep(2200);
return app.pages.all.map(p => p.title);
