/**
 * Published boards, read at build time from the persephone-boards catalog — the same
 * `boards-manifest.json` Persephone's installer reads. A rebuild picks up new boards and versions.
 */
const REPO_RAW = 'https://raw.githubusercontent.com/andriy-viyatyk/persephone-boards/main';
export const BOARDS_REPO = 'https://github.com/andriy-viyatyk/persephone-boards';

export interface Board {
	id: string;
	version: string;
	name: string;
	description: string;
	fileMasks?: string[];
	editorName?: string;
	standalone?: boolean;
	minAppVersion?: string;
	screenshot?: string;
	archive: { url: string; size: number };
}

let cached: Promise<Board[]> | undefined;

export function loadBoards(): Promise<Board[]> {
	cached ??= fetch(`${REPO_RAW}/boards-manifest.json`).then(async (response) => {
		if (!response.ok) throw new Error(`Board catalog request failed: HTTP ${response.status}`);
		const manifest = (await response.json()) as { boards: Board[] };
		return manifest.boards.toSorted((a, b) => a.name.localeCompare(b.name));
	});
	return cached;
}

export function screenshotUrl(board: Board): string | undefined {
	return board.screenshot ? `${REPO_RAW}/boards/${board.id}/${board.screenshot}` : undefined;
}

export function sourceUrl(board: Board): string {
	return `${BOARDS_REPO}/tree/main/boards/${board.id}`;
}
