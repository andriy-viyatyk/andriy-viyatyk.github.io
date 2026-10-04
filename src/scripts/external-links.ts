/**
 * Links that leave the site (GitHub, npm, the av-grid live demo, …) open in a new browser tab, so
 * the reader keeps their place here. Covers every link on the page: Markdown content, sidebar,
 * header icons, hero buttons and cards.
 */

// Other GitHub Pages sites on this host: a repo with its own Pages site owns /<repo-name>/.
const SEPARATE_SITES = ['/av-grid/'];

function leavesSite(link: HTMLAnchorElement): boolean {
	if (link.protocol !== 'http:' && link.protocol !== 'https:') return false;
	if (link.host !== location.host) return true;
	return SEPARATE_SITES.some((prefix) => link.pathname.startsWith(prefix));
}

for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
	if (!leavesSite(link)) continue;
	link.target = '_blank';
	link.relList.add('noopener');
}
