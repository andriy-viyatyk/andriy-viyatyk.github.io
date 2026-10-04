// The av-grid overview video. Every screenshot is the real grid (av-grid 2.12.1 from jsDelivr) on
// fixtures/av-grid/showcase.html: 100,000 generated product rows, opened in a Persephone browser
// tab whose page area is exactly 1296x968. See the av-grid recipe in video/README.md.
import { AbsoluteFill } from 'remotion';
import {
	Appear,
	Caption,
	Code,
	FULL,
	mono,
	palette,
	sans,
	Scene,
	ScenePlayer,
	ShotSequence,
	Terminal,
	totalDuration,
	usePop,
} from '../kit';

const scenes = [
	{ id: 'title', duration: 120, render: (d: number) => <TitleScene duration={d} /> },
	{ id: 'minimal', duration: 150, render: (d: number) => <MinimalScene duration={d} /> },
	{ id: 'rich', duration: 420, render: (d: number) => <RichScene duration={d} /> },
	{ id: 'scroll', duration: 240, render: (d: number) => <ScrollScene duration={d} /> },
	{ id: 'range', duration: 330, render: (d: number) => <RangeScene duration={d} /> },
	{ id: 'paste', duration: 270, render: (d: number) => <PasteScene duration={d} /> },
	{ id: 'edit', duration: 180, render: (d: number) => <EditScene duration={d} /> },
	{ id: 'filter', duration: 330, render: (d: number) => <FilterScene duration={d} /> },
	{ id: 'theme', duration: 180, render: (d: number) => <ThemeScene duration={d} /> },
	{ id: 'customize', duration: 330, render: (d: number) => <CustomizeScene duration={d} /> },
	{ id: 'end', duration: 150, render: (d: number) => <EndScene duration={d} /> },
];

export const AV_GRID_DURATION = totalDuration(scenes);

export const AvGrid = () => <ScenePlayer scenes={scenes} />;

// ---------------------------------------------------------------------------------------------

/** A label naming the feature on screen, bottom left. */
const FeatureTag = ({ at, until, name, note, top }: { at: number; until?: number; name: string; note: string; top?: boolean }) => (
	<AbsoluteFill style={{ justifyContent: top ? 'flex-start' : 'flex-end', alignItems: top ? 'center' : 'flex-start', padding: top ? '30px 0 0' : '0 0 56px 56px' }}>
		<Appear at={at} until={until} dy={16}>
			<div
				style={{
					fontFamily: sans,
					background: 'rgba(11,16,32,0.92)',
					border: `1px solid ${palette.border}`,
					borderLeft: `6px solid ${palette.orange}`,
					borderRadius: 14,
					padding: '16px 26px',
					boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
				}}
			>
				<div style={{ fontSize: 36, fontWeight: 800, color: palette.text }}>{name}</div>
				<div style={{ fontSize: 24, color: palette.muted, marginTop: 4 }}>{note}</div>
			</div>
		</Appear>
	</AbsoluteFill>
);

const TitleScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', fontFamily: sans }}>
			<Appear at={4}>
				<div style={{ color: palette.accent, fontSize: 34, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>av-grid</div>
			</Appear>
			<Appear at={14}>
				<div style={{ color: palette.text, fontSize: 88, fontWeight: 800, lineHeight: 1.08, marginTop: 18 }}>
					A data grid for the DOM.
					<br />
					Built for 100,000+ rows.
				</div>
			</Appear>
			<Appear at={34}>
				<div style={{ color: palette.muted, fontSize: 36, marginTop: 36, maxWidth: 1150 }}>
					No dependencies. No framework. The grid from Persephone, as a library.
				</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

const MinimalScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
			<Terminal
				at={10}
				title="app.js"
				width={1100}
				fontSize={30}
				command={'AVGrid.create("#host", { rows: data });'}
				lines={[
					{ text: '' },
					{ text: '// columns, header labels, widths,', color: palette.muted },
					{ text: '// data types, alignment and row keys —', color: palette.muted },
					{ text: '// all inferred from the rows.', color: palette.muted },
				]}
				lineEvery={8}
			/>
		</AbsoluteFill>
		<Caption at={20} until={duration}>
			The minimum call is one line.
		</Caption>
	</Scene>
);

const RichScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{
					src: 'g-grid.png',
					at: 0,
					marks: [
						{ at: 90, until: 190, x: 354, y: 117, w: 296, h: 240 },
						{ at: 90, until: 190, x: 1005, y: 117, w: 165, h: 240 },
						{ at: 200, until: 300, x: 650, y: 58, w: 355, h: 58 },
						{ at: 310, until: duration, x: 0, y: 926, w: 1282, h: 26 },
						{ at: 310, until: duration, x: 0, y: 58, w: 143, h: 868 },
						{ at: 310, until: duration, x: 1168, y: 58, w: 114, h: 868 },
					],
				},
			]}
			keys={[
				{ at: 0, ...FULL, scale: 0.98 },
				{ at: 60, ...FULL, scale: 0.98 },
				{ at: 90, x: 760, y: 250, scale: 1.55 },
				{ at: 190, x: 760, y: 250, scale: 1.55 },
				{ at: 210, x: 830, y: 200, scale: 1.7 },
				{ at: 300, x: 830, y: 200, scale: 1.7 },
				{ at: 320, x: 648, y: 430, scale: 0.85 },
				{ at: duration, x: 648, y: 430, scale: 0.85 },
			]}
		/>
		<Caption top at={8} until={305}>
			A real grid: 100,000 rows of product sales.
		</Caption>
		<FeatureTag at={95} until={192} name="Your own cell rendering" note="pills, badges, arrows, progress bars — plain HTML" />
		<FeatureTag at={205} until={302} name="Column groups" note="group: “Q1” — the two-row header appears on its own" />
		<FeatureTag top at={315} until={duration} name="Pinned columns and a totals row" note="pinned: “left” | “right”, plus footerRows" />
	</Scene>
);

const Stat = ({ at, value, label }: { at: number; value: string; label: string }) => {
	const pop = usePop(at);
	return (
		<div style={{ transform: `scale(${pop})`, opacity: Math.min(1, pop * 1.5), fontFamily: sans, minWidth: 250 }}>
			<div style={{ fontSize: 46, fontWeight: 800, color: palette.accent }}>{value}</div>
			<div style={{ fontSize: 22, color: palette.muted, marginTop: 2 }}>{label}</div>
		</div>
	);
};

const ScrollScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'g-grid.png', at: 0 },
				{
					src: 'g-scroll.png',
					at: 30,
					marks: [
						{ at: 60, x: 0, y: 117, w: 143, h: 809 },
						{ at: 60, x: 1168, y: 117, w: 114, h: 809 },
					],
				},
			]}
			keys={[
				{ at: 0, ...FULL, scale: 0.98 },
				{ at: 80, x: 648, y: 490, scale: 0.8 },
				{ at: duration, x: 648, y: 490, scale: 0.8 },
			]}
		/>
		<Caption top at={34} until={duration}>
			Row 99,000, scrolled across: SKU and Total stay pinned.
		</Caption>
		<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 26 }}>
			<Appear at={90} dy={20}>
				<div
					style={{
						display: 'flex',
						gap: 50,
						padding: '24px 44px',
						background: 'rgba(11,16,32,0.94)',
						border: `1px solid ${palette.border}`,
						borderRadius: 18,
						boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
					}}
				>
					<Stat at={95} value="~6 ms" label="first paint, 100k rows" />
					<Stat at={110} value="60 fps" label="at the top and at row 99,000" />
					<Stat at={125} value="2 cells" label="repainted per drag move" />
				</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

const RangeScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'g-grid.png', at: 0 },
				{ src: 'g-range-a.png', at: 40 },
				{ src: 'g-range.png', at: 75 },
				{ src: 'g-menu.png', at: 160 },
				{ src: 'g-menu2.png', at: 210, marks: [{ at: 225, until: duration, x: 925, y: 376, w: 206, h: 83 }] },
			]}
			keys={[
				{ at: 0, ...FULL, scale: 0.98 },
				{ at: 35, x: 840, y: 330, scale: 1.6 },
				{ at: duration, x: 860, y: 340, scale: 1.65 },
			]}
		/>
		<Caption top at={8} until={150}>
			Drag to select a range — just like a spreadsheet.
		</Caption>
		<Caption top at={162} until={duration}>
			Copy it as Excel-ready cells, with headers, as JSON or an HTML table.
		</Caption>
	</Scene>
);

const Clipboard = ({ at }: { at: number }) => (
	<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 0 0 50px' }}>
		<Appear at={at} until={95} dy={16}>
			<div
				style={{
					fontFamily: mono,
					fontSize: 28,
					color: palette.text,
					background: 'rgba(10,14,28,0.96)',
					border: `1px solid ${palette.border}`,
					borderLeft: `6px solid ${palette.orange}`,
					borderRadius: 14,
					padding: '20px 28px',
					boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
					lineHeight: 1.5,
				}}
			>
				<div style={{ fontFamily: sans, fontSize: 22, color: palette.muted, marginBottom: 8 }}>copied from a spreadsheet</div>
				{[['36', '8388'], ['52', '7644'], ['470', '83190'], ['455', '85085'], ['392', '36064']].map(([u, r]) => (
					<div key={u} style={{ display: 'flex' }}>
						<span style={{ width: 90 }}>{u}</span>
						<span style={{ color: palette.muted, width: 50 }}>⇥</span>
						<span>{r}</span>
					</div>
				))}
			</div>
		</Appear>
	</AbsoluteFill>
);

const PasteScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'g-paste-a.png', at: 0, marks: [{ at: 20, until: 100, x: 828, y: 476, w: 74, h: 30 }] },
				{
					src: 'g-paste.png',
					at: 100,
					marks: [
						{ at: 115, x: 828, y: 476, w: 177, h: 150 },
						{ at: 160, x: 1005, y: 476, w: 80, h: 150 },
						{ at: 160, x: 1168, y: 476, w: 114, h: 150 },
					],
				},
			]}
			keys={[
				{ at: 0, x: 800, y: 530, scale: 1.5 },
				{ at: duration, x: 810, y: 540, scale: 1.55 },
			]}
		/>
		<Clipboard at={20} />
		<Caption top at={8} until={98}>
			Paste from Excel: one focused cell expands to fit.
		</Caption>
		<Caption top at={104} until={duration}>
			Every pasted cell is validated like typing — and the totals follow.
		</Caption>
	</Scene>
);

const EditScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[{ src: 'g-dropdown.png', at: 0, marks: [{ at: 30, x: 530, y: 266, w: 160, h: 141 }] }]}
			keys={[
				{ at: 0, x: 640, y: 330, scale: 1.4 },
				{ at: duration, x: 620, y: 330, scale: 1.75 },
			]}
		/>
		<Caption top at={8} until={duration}>
			Edit in place. A column with options gets a searchable dropdown.
		</Caption>
	</Scene>
);

const FilterScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'g-filter-pop.png', at: 0, marks: [{ at: 20, until: 105, x: 422, y: 100, w: 260, h: 198 }] },
				{ src: 'g-filter.png', at: 110, marks: [{ at: 125, until: 215, x: 8, y: 56, w: 328, h: 28 }] },
				{
					src: 'g-search.png',
					at: 220,
					marks: [
						{ at: 230, x: 1016, y: 10, w: 266, h: 36 },
						{ at: 245, x: 0, y: 926, w: 1282, h: 26 },
					],
				},
			]}
			keys={[
				{ at: 0, x: 560, y: 260, scale: 1.6 },
				{ at: 100, x: 560, y: 260, scale: 1.6 },
				{ at: 125, x: 648, y: 430, scale: 0.85 },
				{ at: duration, x: 648, y: 430, scale: 0.85 },
			]}
		/>
		<Caption at={8} until={105}>
			Filter any column by its values — the list is searchable.
		</Caption>
		<Caption top at={115} until={215}>
			Applied filters become removable chips. Sort by a header click.
		</Caption>
		<Caption top at={225} until={duration}>
			Search every column; matches are marked, the totals row follows.
		</Caption>
	</Scene>
);

const ThemeScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'g-grid.png', at: 0 },
				{ src: 'g-dark.png', at: 30 },
			]}
			keys={[
				{ at: 0, x: 648, y: 430, scale: 0.85 },
				{ at: duration, x: 648, y: 430, scale: 0.85 },
			]}
		/>
		<Caption top at={20} until={duration}>
			Themed entirely from CSS custom properties: dark mode is zero repaints.
		</Caption>
	</Scene>
);

const HOOKS: [string, string][] = [
	['render', 'draw a cell yourself'],
	['cellClass · headerClass · rowClass', 'color a cell, a header, a row'],
	['editor', 'edit with your own control'],
	['filter', 'filter by anything, not just values'],
	['copyValue', 'copy something other than what is shown'],
	['sortValue', 'sort by something other than the value'],
];

const OPTIONS = [
	'pinned columns',
	'footerRows',
	'column groups',
	'multiSort',
	'selectColumn',
	'options dropdowns',
	'validate',
	'context menu items',
	'add / delete rows & columns',
	'resize & reorder',
	'treeColumn',
	'externalFilter / externalSort',
	'persistFilters',
	'React wrapper',
];

const HookRow = ({ at, name, what }: { at: number; name: string; what: string }) => (
	<Appear at={at} dy={12}>
		<div style={{ display: 'flex', alignItems: 'baseline', gap: 22, fontFamily: sans, padding: '9px 0' }}>
			<div style={{ width: 600, textAlign: 'right', fontSize: 28, whiteSpace: 'nowrap' }}>
				<Code color={palette.accent}>{name}</Code>
			</div>
			<div style={{ fontSize: 30, color: palette.text }}>{what}</div>
		</div>
	</Appear>
);

const Chip = ({ at, label }: { at: number; label: string }) => {
	const pop = usePop(at);
	return (
		<div
			style={{
				transform: `scale(${pop})`,
				opacity: Math.min(1, pop * 1.5),
				fontFamily: sans,
				fontSize: 24,
				color: palette.text,
				padding: '8px 18px',
				borderRadius: 999,
				border: `1px solid ${palette.accent2}`,
				background: `${palette.accent2}1f`,
			}}
		>
			{label}
		</div>
	);
};

const CustomizeScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ alignItems: 'center', paddingTop: 70, fontFamily: sans }}>
			<Appear at={4}>
				<div style={{ fontSize: 52, fontWeight: 800, color: palette.text, textAlign: 'center' }}>Customize with plain functions</div>
			</Appear>
			<Appear at={14}>
				<div style={{ fontSize: 28, color: palette.muted, marginTop: 10, textAlign: 'center' }}>
					A hook is a property on a column — no plugins, no registration.
				</div>
			</Appear>
			<div style={{ marginTop: 34 }}>
				{HOOKS.map(([name, what], i) => (
					<HookRow key={name} at={30 + i * 14} name={name} what={what} />
				))}
			</div>
			<Appear at={140}>
				<div style={{ fontSize: 28, color: palette.muted, marginTop: 34 }}>…and options for the rest:</div>
			</Appear>
			<div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 20, maxWidth: 1260 }}>
				{OPTIONS.map((o, i) => (
					<Chip key={o} at={150 + i * 6} label={o} />
				))}
			</div>
		</AbsoluteFill>
	</Scene>
);

const EndScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: sans, textAlign: 'center' }}>
			<Appear at={4}>
				<div style={{ fontSize: 96, fontWeight: 800, color: palette.text }}>av-grid</div>
			</Appear>
			<Appear at={16}>
				<div style={{ fontSize: 40, marginTop: 24 }}>
					<Code color={palette.orange}>npm install av-grid</Code>
				</div>
			</Appear>
			<Appear at={30}>
				<div style={{ fontSize: 30, color: palette.muted, marginTop: 40, lineHeight: 1.6 }}>
					Live demo: andriy-viyatyk.github.io/av-grid
					<br />
					github.com/andriy-viyatyk/av-grid
				</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);
