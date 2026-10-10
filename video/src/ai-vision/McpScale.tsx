// The "one tool, not hundreds" explainer for /ai-vision/mcp-at-scale/. A wall of flat MCP tools
// (named after real Persephone members) piles up past what an agent can choose from reliably; then
// the same object model as an ai-vision tree, browsed one branch at a time; then a real `call`
// session on a generic products.csv, with its real "Did you mean" correction; then the result
// screenshot and a side-by-side comparison. See the recipe in video/README.md.
import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
	Appear,
	Caption,
	ChatBubble,
	mono,
	palette,
	sans,
	Scene,
	ScenePlayer,
	ShotSequence,
	StepLog,
	totalDuration,
	tween,
	type SceneDef,
	type Step,
} from '../kit';

// Counted from the descriptor sources of Persephone 5.0.10: `kind: "method"` and `kind: "property"`.
const METHODS = 412;
const PROPERTIES = 477;

const Title = ({ children, at = 0 }: { children: ReactNode; at?: number }) => (
	<Appear at={at} style={{ position: 'absolute', left: 0, right: 0, top: 64, textAlign: 'center' }}>
		<div style={{ fontFamily: sans, fontSize: 46, fontWeight: 700, color: palette.text }}>{children}</div>
	</Appear>
);

// ── Intro ───────────────────────────────────────────────────────────────────────────────────────

const Intro = ({ d }: { d: number }) => (
	<Scene duration={d}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: sans, textAlign: 'center' }}>
			<Appear at={6}>
				<div style={{ fontSize: 34, color: palette.accent, fontWeight: 600, letterSpacing: 1 }}>AI-VISION</div>
			</Appear>
			<Appear at={14}>
				<div style={{ fontSize: 84, fontWeight: 800, color: palette.text, marginTop: 10 }}>One tool, not hundreds</div>
			</Appear>
			<Appear at={28}>
				<div style={{ fontSize: 36, color: palette.muted, marginTop: 18 }}>How an agent drives a large app over MCP</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

// ── The flat tool wall ──────────────────────────────────────────────────────────────────────────

// Real Persephone members, written the way a flat MCP server would name them.
const TOOL_NAMES = [
	'pages_open_file', 'pages_close_page', 'pages_show_page', 'pages_add_empty_page', 'pages_add_editor_page',
	'pages_open_links', 'pages_open_diff', 'pages_group', 'pages_ungroup', 'pages_pin_tab', 'pages_move_tab',
	'pages_open_url', 'pages_open_url_in_browser_tab', 'pages_show_browser_page', 'pages_show_settings_page',
	'page_get_content', 'page_set_content', 'page_switch_editor', 'grid_add_rows', 'grid_delete_rows',
	'grid_add_columns', 'grid_delete_columns', 'grid_edit_cell', 'grid_set_search', 'grid_clear_search',
	'grid_get_filters', 'grid_get_sort', 'grid_set_csv_delimiter', 'grid_set_csv_with_columns', 'grid_get_rows',
	'grid_get_selection', 'grid_highlight', 'browser_click', 'browser_type', 'browser_wait_for', 'browser_snapshot',
	'browser_evaluate', 'browser_screenshot', 'browser_hover', 'browser_press_key', 'browser_drag', 'browser_reload',
	'boards_create_board', 'boards_open_board', 'boards_register_board', 'boards_install', 'boards_uninstall',
	'boards_list', 'board_app_call', 'fs_read_file', 'fs_write_file', 'fs_list_folder', 'fs_delete', 'fs_rename',
	'ui_highlight', 'ui_notify', 'ui_confirm', 'ui_guide_step', 'dialogs_click', 'menus_click', 'menus_close',
	'settings_get', 'settings_set', 'themes_list', 'themes_preview', 'themes_derive', 'window_zoom_in',
	'window_open_new', 'window_close', 'window_resize', 'proc_spawn', 'proc_kill', 'shell_open_url',
	'shell_encrypt', 'tools_search', 'tools_execute', 'editors_list', 'recent_list', 'downloads_list',
	'events_wait', 'guides_search', 'guides_read', 'script_execute', 'log_view_push', 'compare_enter',
	'compare_exit', 'site_extensions_list', 'site_extensions_reload', 'board_vars_set', 'clipboard_list',
	'notebook_add_cell', 'notebook_run_cell', 'markdown_scroll_to', 'monaco_reveal_line', 'monaco_select',
	'git_panel_highlight', 'explorer_open_boards', 'archive_list_entries', 'pdf_go_to_page', 'image_zoom',
];

// The near-duplicates an agent confuses once the list is long; they turn orange in the wall.
const CONFUSABLE = new Set(['grid_set_search', 'grid_get_filters', 'browser_type', 'page_set_content', 'pages_open_url', 'pages_open_url_in_browser_tab', 'pages_open_file', 'guides_search', 'tools_search']);

const ToolWall = ({ d }: { d: number }) => {
	const frame = useCurrentFrame();
	const shownTools = Math.floor(tween(frame, [20, 200], [0, TOOL_NAMES.length]));
	const counted = Math.round(tween(frame, [20, 260], [0, METHODS + PROPERTIES]));
	const blur = frame > 290;
	return (
		<Scene duration={d}>
			<Title>If every member were its own MCP tool…</Title>
			<div style={{ position: 'absolute', left: 70, right: 70, top: 150, height: 600, overflow: 'hidden', display: 'flex', flexWrap: 'wrap', gap: 9, alignContent: 'flex-start' }}>
				{TOOL_NAMES.slice(0, shownTools).map((name) => {
					const hot = blur && CONFUSABLE.has(name);
					return (
						<div
							key={name}
							style={{
								fontFamily: mono, fontSize: 18, padding: '6px 11px', borderRadius: 8,
								color: hot ? palette.bg : palette.text,
								background: hot ? palette.orange : palette.panel,
								border: `1px solid ${hot ? palette.orange : palette.border}`,
								opacity: blur && !hot ? 0.45 : 1,
							}}
						>
							{name}
						</div>
					);
				})}
			</div>
			<Appear at={30} style={{ position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', fontFamily: sans }}>
				<span style={{ fontSize: 64, fontWeight: 800, fontFamily: mono, color: counted > 300 ? palette.red : palette.text }}>{counted}</span>
				<span style={{ fontSize: 30, color: palette.muted, marginLeft: 18 }}>members in Persephone's model, each a tool</span>
			</Appear>
			<Caption at={110} until={285}>All loaded, they fill the context; searched, they still look alike</Caption>
			<Caption at={295}>Past a few dozen, similar tools blur and the agent picks the wrong one</Caption>
		</Scene>
	);
};

// ── The tree ────────────────────────────────────────────────────────────────────────────────────

type Column = { path: string; kind: string; items: string[]; pick: number; more?: string; at: number };

// Real hints from `call`: the overview, `pages`, `pages[0]` and the grid editor.
const COLUMNS: Column[] = [
	{ path: 'call()', kind: 'Persephone', items: ['pages', 'page', 'boards', 'fs', 'ui', 'settings', 'windows', 'guides', 'script'], pick: 0, more: '+19 more', at: 20 },
	{ path: 'pages', kind: 'Pages', items: ['pages[0] "products.csv"', 'logView', 'compare', 'openFile()', 'addEditorPage()', 'openUrl()', 'group()'], pick: 0, more: '+28 more', at: 80 },
	{ path: 'pages[0]', kind: 'Page', items: ['content', 'title', 'editorSwitches', 'editor', 'panels'], pick: 3, more: '+11 more', at: 140 },
	{ path: 'pages[0].editor', kind: 'GridEditor', items: ['rows', 'columns', 'filters', 'visibleRowCount', 'addRows()', 'editCell()', 'setSearch()', 'clearSearch()'], pick: 6, more: '+17 more', at: 200 },
];

const COL_W = 305;
const COL_GAP = 22;

const TreeColumn = ({ col, index }: { col: Column; index: number }) => {
	const frame = useCurrentFrame();
	const picked = frame >= col.at + 36;
	return (
		<Appear at={col.at} dy={0} style={{ position: 'absolute', left: 70 + index * (COL_W + COL_GAP), top: 170, width: COL_W }}>
			<div style={{ background: palette.panel, border: `2px solid ${palette.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
				<div style={{ padding: '14px 18px', background: palette.bg2, borderBottom: `1px solid ${palette.border}` }}>
					<div style={{ fontFamily: mono, fontSize: 21, color: palette.accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.path}</div>
					<div style={{ fontFamily: sans, fontSize: 18, color: palette.muted, marginTop: 2 }}>{col.kind}</div>
				</div>
				<div style={{ padding: '10px 10px 14px' }}>
					{col.items.map((item, i) => {
						const isPick = i === col.pick;
						const lit = picked && isPick;
						return (
							<div
								key={item}
								style={{
									fontFamily: mono, fontSize: 19, padding: '7px 10px', borderRadius: 8, marginTop: 4,
									whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
									color: lit ? palette.bg : picked ? palette.muted : palette.text,
									background: lit ? palette.accent : 'transparent',
									fontWeight: lit ? 700 : 400,
									opacity: picked && !isPick ? 0.55 : 1,
								}}
							>
								{item}
							</div>
						);
					})}
					{col.more && <div style={{ fontFamily: sans, fontSize: 17, color: palette.muted, padding: '8px 10px 0' }}>{col.more}</div>}
				</div>
			</div>
		</Appear>
	);
};

const Tree = ({ d }: { d: number }) => (
		<Scene duration={d}>
			<Title>ai-vision: the same model as a tree, behind one tool</Title>
			{COLUMNS.map((col, i) => (
				<TreeColumn key={col.path} col={col} index={i} />
			))}
			<Appear at={270} style={{ position: 'absolute', left: 70, right: 70, top: 690, textAlign: 'center' }}>
				<div style={{ fontFamily: mono, fontSize: 34, color: palette.text }}>
					call(<span style={{ color: palette.accent }}>"pages[0].editor.setSearch"</span>, [<span style={{ color: palette.orange }}>"Furniture"</span>])
				</div>
			</Appear>
			<Appear at={300} style={{ position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center', fontFamily: sans, fontSize: 28, color: palette.muted }}>
				Each step returns its node and the members under it, so the next step is a lookup, not a guess.
			</Appear>
			<Caption at={20} until={260}>The agent opens only the branch its task needs</Caption>
			<Caption at={330}>Branches it never opens cost it nothing</Caption>
		</Scene>
);

// ── The real session ────────────────────────────────────────────────────────────────────────────

const ASK = 'Show only the furniture in my products.csv.';

// A real session on video/fixtures/ai-vision-mcp/products.csv, shortened. Paths are shown without
// the `windows[N].` prefix of the capture window.
const SESSION: Step[] = [
	{ call: 'call()', result: 'Persephone 5.0.10 · 28 members: pages, page, boards, fs, ui, …' },
	{ call: 'call("pages")', result: '1 page: pages[0] "products.csv" (monaco) ← active' },
	{ call: 'call("pages[0].editorSwitches.switchTo", ["grid-csv"])', result: 'switched to Grid (CSV)' },
	{ call: 'call("pages[0].editor")', result: 'GridEditor · 7 rows · columns a, b, c, d · 25 members' },
	{ call: 'call("pages[0].editor.setCsvWithColumns", [true])', result: 'the first row becomes the headers' },
	{ call: 'call("pages[0].editor.filter", ["Furniture"])', result: '"filter" is not a member of GridEditor. Did you mean "filters"?', error: true },
	{ call: 'call("pages[0].editor.setSearch", ["Furniture"])', result: 'done' },
	{ call: 'call("pages[0].editor.visibleRowCount")', result: '2' },
];

const STEP_EVERY = 40;

const Session = ({ d }: { d: number }) => (
	<Scene duration={d}>
		<AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', padding: '150px 100px 0' }}>
			<div style={{ width: 1240, display: 'flex', flexDirection: 'column', gap: 30 }}>
				<ChatBubble at={6} who="user" text={ASK} width={900} charsPerFrame={1.6} />
				<StepLog at={60} steps={SESSION} every={STEP_EVERY} visible={6} />
			</div>
		</AbsoluteFill>
		<Caption top at={60} until={60 + 5 * STEP_EVERY}>A real session: one tool, eight calls, no guide read first</Caption>
		<Caption top at={60 + 5 * STEP_EVERY + 10}>A wrong name gets back the valid ones, and the agent corrects itself</Caption>
	</Scene>
);

// Screenshots are 864x645 captures drawn into the 1296x968 box, so coordinates here are 1.5x the PNG's.
const GRID = { x: 420, y: 300, scale: 1.45 };

const Result = ({ d }: { d: number }) => (
	<Scene duration={d}>
		<ShotSequence
			shots={[
				{ src: 'mcp-grid-before.png', at: 0, marks: [{ at: 20, until: 70, x: 4, y: 148, w: 542, h: 36 }] },
				{ src: 'mcp-grid-after.png', at: 80, marks: [{ at: 100, x: 710, y: 70, w: 300, h: 36 }, { at: 120, x: 1036, y: 926, w: 140, h: 32 }] },
			]}
			keys={[
				{ at: 0, ...GRID },
				{ at: 70, ...GRID },
				{ at: 110, x: 648, y: 484, scale: 1.08 },
				{ at: d, x: 648, y: 484, scale: 1.1 },
			]}
		/>
		<Caption at={10} until={80}>Before: the header row is data, and every category shows</Caption>
		<Caption at={95}>After: headers on, filtered to Furniture, 2 of 6 rows</Caption>
	</Scene>
);

// ── Comparison ──────────────────────────────────────────────────────────────────────────────────

const ROWS: { label: string; flat: string; tree: string }[] = [
	{ label: 'Context per turn', flat: 'All schemas, or a search to guess', tree: 'The overview, then one branch' },
	{ label: 'Wrong name', flat: '"Tool not found"', tree: 'The valid names + "Did you mean"' },
	{ label: 'Tool #500', flat: 'Makes every task harder', tree: 'Costs nothing until it is visited' },
	{ label: 'Plug-ins', flat: 'Another server, more tools', tree: 'A board or web page adds a subtree' },
];

const Compare = ({ d }: { d: number }) => (
	<Scene duration={d}>
		<Title>Flat tools vs. one ai-vision tool</Title>
		<div style={{ position: 'absolute', left: 90, right: 90, top: 190, fontFamily: sans }}>
			<div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 1fr', gap: 18, fontSize: 26, color: palette.muted, padding: '0 24px 14px' }}>
				<div />
				<div style={{ color: palette.red, fontWeight: 700 }}>Flat MCP tools</div>
				<div style={{ color: palette.accent, fontWeight: 700 }}>ai-vision call</div>
			</div>
			{ROWS.map((r, i) => (
				<Appear key={r.label} at={20 + i * 34}>
					<div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 1fr', gap: 18, alignItems: 'center', background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: 16, padding: '26px 24px', marginTop: 16 }}>
						<div style={{ fontSize: 28, fontWeight: 700, color: palette.text }}>{r.label}</div>
						<div style={{ fontSize: 27, color: palette.muted }}>{r.flat}</div>
						<div style={{ fontSize: 27, color: palette.text }}>{r.tree}</div>
					</div>
				</Appear>
			))}
		</div>
	</Scene>
);

const Outro = ({ d }: { d: number }) => (
	<Scene duration={d}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: sans, textAlign: 'center' }}>
			<Appear at={4}>
				<div style={{ fontSize: 72, fontWeight: 800, color: palette.text }}>ai-vision</div>
			</Appear>
			<Appear at={14}>
				<div style={{ fontSize: 34, color: palette.muted, marginTop: 14 }}>Plain MCP today: one tool, a tree behind it</div>
			</Appear>
			<Appear at={24}>
				<div style={{ fontFamily: mono, fontSize: 32, color: palette.accent, marginTop: 30 }}>npm install ai-vision</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

const scenes: SceneDef[] = [
	{ id: 'intro', duration: 100, render: (d) => <Intro d={d} /> },
	{ id: 'wall', duration: 450, render: (d) => <ToolWall d={d} /> },
	{ id: 'tree', duration: 450, render: (d) => <Tree d={d} /> },
	{ id: 'session', duration: 60 + SESSION.length * STEP_EVERY + 150, render: (d) => <Session d={d} /> },
	{ id: 'result', duration: 240, render: (d) => <Result d={d} /> },
	{ id: 'compare', duration: 300, render: (d) => <Compare d={d} /> },
	{ id: 'outro', duration: 100, render: (d) => <Outro d={d} /> },
];

export const MCP_SCALE_DURATION = totalDuration(scenes);

export const McpScale = () => <ScenePlayer scenes={scenes} />;
