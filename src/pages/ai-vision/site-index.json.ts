import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { loadBoards, sourceUrl } from '../../lib/boards';

/**
 * Every page on the site and every catalog board, for the site's ai-vision model
 * (src/scripts/site-model.ts). The model loads this once per page so its `pages` and `boards`
 * collections can be indexed synchronously.
 */
export interface SiteIndex {
	pages: { title: string; path: string; description: string; section: string }[];
	boards: { id: string; name: string; description: string; fileMasks: string[]; path: string; source: string }[];
}

export const GET: APIRoute = async () => {
	const docs = await getCollection('docs', (entry) => !entry.data.draft);
	const boards = await loadBoards();
	const index: SiteIndex = {
		pages: [
			...docs.map((entry) => ({
				title: entry.data.title,
				path: entry.id === 'index' ? '/' : `/${entry.id}/`,
				description: entry.data.description ?? '',
				section: entry.id === 'index' ? 'home' : entry.id.split('/')[0],
			})),
			{ title: 'Persephone boards', path: '/boards/', description: 'The board catalog.', section: 'boards' },
			...boards.map((board) => ({ title: board.name, path: `/boards/${board.id}/`, description: board.description, section: 'boards' })),
		].toSorted((a, b) => a.path.localeCompare(b.path)),
		boards: boards.map((board) => ({
			id: board.id,
			name: board.name,
			description: board.description,
			fileMasks: board.fileMasks ?? [],
			path: `/boards/${board.id}/`,
			source: sourceUrl(board),
		})),
	};
	return new Response(JSON.stringify(index), { headers: { 'content-type': 'application/json' } });
};
