/**
 * The site's own ai-vision model. Every page publishes it as window.__aiVision, so an agent driving
 * Persephone's browser reads it at pages["<id>"].editor.app instead of parsing the page snapshot.
 * Outside Persephone nothing reads it.
 *
 * The model is read-only apart from navigation and the colour theme: it describes the current page,
 * lists every page and catalog board (from /ai-vision/site-index.json), searches the site with
 * Pagefind, and points at the main controls on screen.
 */
import { helpSearch } from 'ai-vision';
import { createElements, highlightElement } from 'ai-vision/dom';
import { expose } from 'ai-vision/remote';
import type { SiteIndex } from '../pages/ai-vision/site-index.json';

type Theme = 'auto' | 'dark' | 'light';
type PageEntry = SiteIndex['pages'][number];
type BoardEntry = SiteIndex['boards'][number];

const THEMES: Theme[] = ['auto', 'dark', 'light'];

const content = () => document.querySelector<HTMLElement>('main .sl-markdown-content');
const headingElements = () => [...(content()?.querySelectorAll<HTMLElement>('h2[id], h3[id]') ?? [])];

function headingList() {
	return headingElements().map((h) => ({ id: h.id, level: Number(h.tagName[1]), text: h.textContent?.trim() ?? '' }));
}

function findHeading(key: unknown): HTMLElement {
	const wanted = String(key ?? '').trim().toLowerCase();
	const heading = headingElements().find((h) => h.id === wanted || h.textContent?.trim().toLowerCase() === wanted);
	if (!heading) {
		const known = headingList().map((h) => `"${h.text}"`).join(', ') || '(this page has no sections)';
		throw new Error(`No section "${String(key)}" on this page. Sections: ${known}.`);
	}
	return heading;
}

/** Text from a heading up to the next heading of the same or a higher level. */
function sectionText(heading: HTMLElement): string {
	const level = Number(heading.tagName[1]);
	// Starlight wraps each heading in a div.sl-heading-wrapper; its siblings hold the section.
	const start = heading.closest('.sl-heading-wrapper') ?? heading;
	const parts = [heading.textContent?.trim() ?? ''];
	for (let node = start.nextElementSibling; node; node = node.nextElementSibling) {
		const next = node.matches('h2, h3, h4') ? node : node.querySelector(':scope > h2, :scope > h3, :scope > h4');
		if (next && Number(next.tagName[1]) <= level) break;
		const text = (node as HTMLElement).innerText?.trim();
		if (text) parts.push(text);
	}
	return parts.join('\n\n');
}

function clipList() {
	return [...document.querySelectorAll<HTMLElement>('.demo-clip')].map((figure) => {
		const media = figure.querySelector<HTMLImageElement | HTMLVideoElement>('img, video');
		return { src: media?.getAttribute('src') ?? '', caption: figure.querySelector('figcaption')?.textContent?.trim() ?? '' };
	});
}

function currentTheme(): Theme {
	const select = document.querySelector<HTMLSelectElement>('starlight-theme-select select');
	return THEMES.includes(select?.value as Theme) ? (select!.value as Theme) : 'auto';
}

function setTheme(value: unknown) {
	const theme = String(value) as Theme;
	if (!THEMES.includes(theme)) throw new Error(`Unknown theme "${String(value)}". Use one of: ${THEMES.join(', ')}.`);
	// Go through the picker so Starlight stores the choice and updates every picker on the page.
	document.querySelectorAll<HTMLSelectElement>('starlight-theme-select select').forEach((select) => {
		select.value = theme;
		select.dispatchEvent(new Event('change'));
	});
}

function normalizePath(path: unknown): string {
	const text = String(path ?? '').trim();
	if (!text) throw new Error('open needs a site path such as "/persephone/workspace/". Read pages for the list.');
	const url = new URL(text, location.origin);
	if (url.origin !== location.origin) throw new Error(`open only navigates within this site; "${text}" is on ${url.origin}.`);
	return url.pathname.replace(/\/?$/, '/') + url.hash;
}

interface PagefindResult {
	url: string;
	excerpt: string;
	meta: { title?: string };
	sub_results?: { title: string; url: string }[];
}

async function search(query: unknown, limit: unknown) {
	const text = String(query ?? '').trim();
	if (!text) throw new Error('search needs a query, for example search("install a board").');
	const max = typeof limit === 'number' && limit > 0 ? Math.min(limit, 20) : 5;
	let pagefind: { search(q: string): Promise<{ results: { data(): Promise<PagefindResult> }[] }> };
	try {
		const bundle = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/pagefind/pagefind.js`;
		pagefind = await import(/* @vite-ignore */ bundle);
	} catch {
		throw new Error('Search is only available on the built site (the Pagefind index is not served by astro dev).');
	}
	const found = await pagefind.search(text);
	const data = await Promise.all(found.results.slice(0, max).map((result) => result.data()));
	return data.map((page) => ({
		title: page.meta.title ?? '',
		path: new URL(page.url, location.origin).pathname,
		excerpt: page.excerpt.replace(/<[^>]+>/g, ''),
		sections: (page.sub_results ?? []).slice(0, 3).map((sub) => sub.title),
	}));
}

function open(path: unknown) {
	const target = normalizePath(path);
	setTimeout(() => location.assign(target), 0);
	return `Opening ${target}. The page reloads and publishes a fresh model; read pages["<id>"].editor.app again.`;
}

const elementDeclarations = [
	{ name: 'search', selector: 'site-search button[data-open-modal]', purpose: 'Opens the site search dialog.', where: 'Header, in the middle (a magnifier icon on narrow screens).' },
	{ name: 'theme', selector: 'starlight-theme-select select', purpose: 'The colour theme picker: Dark, Light or Auto.', where: 'Header, right side.' },
	{ name: 'github', selector: '.social-icons a[href*="github.com"]', purpose: 'Link to the author’s GitHub profile.', where: 'Header, right side.' },
	{ name: 'sidebar', selector: 'nav.sidebar', purpose: 'Site navigation: Persephone, ai-vision, av-grid and Posts.', where: 'Left column (behind the menu button on narrow screens).' },
	{ name: 'toc', selector: 'starlight-toc', purpose: 'The “On this page” list of the current page’s sections.', where: 'Right column, on wide screens only.' },
	{ name: 'content', selector: 'main .sl-markdown-content', purpose: 'The text of the current page.', where: 'Middle column.' },
	{ name: 'demo-clip', selector: '.demo-clip', purpose: 'The first looping demo clip on the page.', where: 'Near the top of the page, when it has one.' },
];

function buildModel(index: SiteIndex) {
	const elements = createElements(elementDeclarations, highlightElement);

	const pageSummary = (p: PageEntry) => ({ kind: 'SitePageEntry', title: p.title, path: p.path, section: p.section, description: p.description });
	const makePageEntry = (p: PageEntry) => ({
		aiVision: {
			kind: 'SitePageEntry',
			summary: 'One page of the site. Its path is what open() takes.',
			members: [
				{ name: 'title', kind: 'property', summary: 'Page title.' },
				{ name: 'path', kind: 'property', summary: 'Site path, such as "/persephone/workspace/".' },
				{ name: 'section', kind: 'property', summary: 'Top-level area: home, persephone, ai-vision, grid, blog or boards.' },
				{ name: 'description', kind: 'property', summary: 'One-line description, or an empty string.' },
				{ name: 'open', kind: 'method', signature: 'open()', summary: 'Navigate the browser tab to this page.' },
			],
			summarize: () => pageSummary(p),
		},
		title: p.title,
		path: p.path,
		section: p.section,
		description: p.description,
		open: () => open(p.path),
	});
	const pagesNode = {
		aiVision: {
			kind: 'SitePages',
			summary: 'Every page on the site, sorted by path. Index by position or by path: pages["/persephone/"].',
			members: [{ name: 'count', kind: 'property', summary: 'Number of pages.' }],
			index: (key: unknown) => {
				const entry = typeof key === 'number' ? index.pages[key] : index.pages.find((p) => p.path === normalizePathSafe(key));
				return entry ? makePageEntry(entry) : undefined;
			},
			summarize: () => index.pages.map((p) => ({ title: p.title, path: p.path })),
		},
		get count() { return index.pages.length; },
	};

	const boardSummary = (b: BoardEntry) => ({ kind: 'CatalogBoard', id: b.id, name: b.name, description: b.description, fileMasks: b.fileMasks });
	const makeBoard = (b: BoardEntry) => ({
		aiVision: {
			kind: 'CatalogBoard',
			summary: 'One board from Persephone’s published catalog. Installing happens in Persephone, not on this site.',
			members: [
				{ name: 'id', kind: 'property', summary: 'Catalog id, as in boards-manifest.json.' },
				{ name: 'name', kind: 'property', summary: 'Display name.' },
				{ name: 'description', kind: 'property', summary: 'One-line description.' },
				{ name: 'fileMasks', kind: 'property', summary: 'File patterns the board opens, such as "*.torrent"; empty for a standalone board.' },
				{ name: 'path', kind: 'property', summary: 'The board’s page on this site.' },
				{ name: 'source', kind: 'property', summary: 'The board’s source folder on GitHub.' },
				{ name: 'open', kind: 'method', signature: 'open()', summary: 'Navigate to the board’s page on this site.' },
			],
			summarize: () => boardSummary(b),
		},
		...b,
		open: () => open(b.path),
	});
	const boardsNode = {
		aiVision: {
			kind: 'CatalogBoards',
			summary: 'Boards published in Persephone’s catalog, sorted by name. Index by position or by id: boards["torrent-viewer"].',
			members: [{ name: 'count', kind: 'property', summary: 'Number of boards.' }],
			index: (key: unknown) => {
				const entry = typeof key === 'number' ? index.boards[key] : index.boards.find((b) => b.id === key);
				return entry ? makeBoard(entry) : undefined;
			},
			summarize: () => index.boards.map(boardSummary),
		},
		get count() { return index.boards.length; },
	};

	const page = {
		aiVision: {
			kind: 'SiteCurrentPage',
			summary: 'The page open in this browser tab.',
			members: [
				{ name: 'title', kind: 'property', summary: 'Page title.' },
				{ name: 'path', kind: 'property', summary: 'Site path of this page.' },
				{ name: 'description', kind: 'property', summary: 'The page’s meta description.' },
				{ name: 'headings', kind: 'property', summary: 'Sections of the page: { id, level, text } for every h2 and h3.' },
				{ name: 'clips', kind: 'property', summary: 'Demo clips on the page: { src, caption }.' },
				{ name: 'text', kind: 'property', summary: 'The whole page text. Long; prefer section().' },
				{ name: 'section', kind: 'method', signature: 'section(heading: string)', summary: 'Text of one section, by heading text or id.' },
				{ name: 'scrollTo', kind: 'method', signature: 'scrollTo(heading: string)', summary: 'Scroll the section into view, by heading text or id, so the user sees it.' },
			],
			summarize: () => ({ kind: 'SiteCurrentPage', title: page.title, path: page.path, sections: headingList().map((h) => h.text), clips: clipList().length }),
		},
		get title() { return document.querySelector('h1#_top')?.textContent?.trim() ?? document.title; },
		get path() { return location.pathname; },
		get description() { return document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? ''; },
		get headings() { return headingList(); },
		get clips() { return clipList(); },
		get text() { return content()?.innerText.trim() ?? ''; },
		section: (heading: unknown) => sectionText(findHeading(heading)),
		scrollTo: (heading: unknown) => {
			const target = findHeading(heading);
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			return target.textContent?.trim();
		},
	};

	const root = {
		aiVision: {
			kind: 'Site',
			summary: 'The andriy-viyatyk.github.io site: docs and demos for Persephone, ai-vision, av-grid and Persephone boards.',
			overview: 'Read page for the page in this tab; page.section("<heading>") for one section.\nRead pages or call search("...") to find a page; open("<path>") to go there.\nRead boards for the Persephone board catalog.',
			help: 'This is a static documentation site. The model reads it and navigates it; it cannot change content. '
				+ 'page describes only the page open in this tab. open() and pages[i].open() reload the tab, so read pages["<id>"].editor.app again afterwards. '
				+ 'search() uses the site’s Pagefind index and returns the best pages with an excerpt. '
				+ 'boards lists the published Persephone boards; installing one is done in Persephone (an agent can use its boards API), not here. '
				+ 'theme switches the colour theme and is remembered by this browser. highlight(name, message) points the user at a control on screen.',
			members: [
				{ name: 'page', kind: 'property', node: true, summary: 'The page open in this tab: title, sections, clips, text.' },
				{ name: 'pages', kind: 'property', node: true, indexable: true, summary: 'Every page on the site with its path.' },
				{ name: 'boards', kind: 'property', node: true, indexable: true, summary: 'The Persephone board catalog.' },
				{ name: 'search', kind: 'method', signature: 'search(query: string, limit?: number)', summary: 'Full-text search over the site; returns { title, path, excerpt, sections } for the best matches (5 by default, at most 20).' },
				{ name: 'open', kind: 'method', signature: 'open(path: string)', summary: 'Navigate this tab to a site path, such as "/persephone/workspace/" (a "#section" suffix is kept).' },
				{ name: 'theme', kind: 'property', writable: true, summary: 'Colour theme: "auto", "dark" or "light". Setting it is remembered by this browser.' },
				{ name: 'helpSearch', kind: 'method', signature: 'helpSearch(query: string, limit?: number)', summary: 'Find a member or on-screen control of this model by purpose.' },
				...elements.members,
			],
			elements: elementDeclarations,
			provide: elements.provide,
			summarize: () => ({ kind: 'Site', page: page.title, path: location.pathname, pages: index.pages.length, boards: index.boards.length, theme: currentTheme() }),
		},
		get page() { return page; },
		get pages() { return pagesNode; },
		get boards() { return boardsNode; },
		search,
		open,
		get theme() { return currentTheme(); },
		set theme(value: unknown) { setTheme(value); },
		helpSearch: (query: unknown, limit: unknown) => helpSearch(root, String(query ?? ''), typeof limit === 'number' ? limit : undefined),
	};
	return root;
}

function normalizePathSafe(key: unknown): string | undefined {
	try { return normalizePath(key); } catch { return undefined; }
}

async function publish() {
	let index: SiteIndex = { pages: [], boards: [] };
	try {
		const response = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/ai-vision/site-index.json`);
		if (response.ok) index = await response.json();
	} catch {
		// The model still describes the current page without the index.
	}
	expose(buildModel(index));
}

void publish();
