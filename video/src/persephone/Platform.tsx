// "A notepad on the outside, a platform on the inside" — the Persephone overview video.
// Screenshots come from a clean 1296x968 Persephone window on the generic demo folders in
// fixtures/persephone/ (copied to C:\Demo). The last part is a real agent session: a separate
// Claude agent built the Budget viewer through the MCP `call` tool; its reply and tool calls are
// shown shortened.
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
	Appear,
	Caption,
	ChatBubble,
	Code,
	FULL,
	palette,
	sans,
	Scene,
	ScenePlayer,
	ShotSequence,
	StepLog,
	Thinking,
	totalDuration,
	tween,
	usePop,
	type Mark,
	type SceneDef,
	type Step,
} from '../kit';

const ASK =
	'I keep my monthly expenses in *.budget.csv files. Make me a viewer for them: spending by category as a chart, the month’s total, and the biggest expenses. It should open right away when I open one of these files.';

const BUILD_STEPS: Step[] = [
	{ call: 'guides.agents.boards   (windowIndex: 3)', result: 'the boards guide: custom editors, charts, ai-vision' },
	{ call: 'GET boards-assets/manifest.json', result: 'chart.js 4.4.6 + its Persephone theme adapter' },
	{ call: 'boards.createBoard("Budget", "…\\.persephone\\boards")', result: 'board created inside the workspace, trusted' },
	{ call: 'write board-manifest.json', result: 'editor for *.budget.csv, priority 60 — above Grid (CSV)' },
	{ call: 'write app.js   (bash heredoc)', result: 'error: unexpected EOF', error: true },
	{ call: 'write app.js   (Write tool)', result: 'totals, category chart, biggest expenses, .app model' },
	{ call: 'pages["6104…"].editorSwitches', result: 'still only Text Editor | Grid (CSV): the manifest is cached', error: true },
	{ call: 'boards.renameBoard(Budget → Budget-tmp → Budget)', result: 'manifest reloaded, trust kept' },
	{ call: 'editorSwitches.switchTo("board-editor:…\\Budget")', result: 'the CSV now opens in Budget' },
	{ call: 'editor.screenshot()', result: 'looks good — but the 7th bar reuses the accent color' },
	{ call: 'edit the palette · editor.reload()', result: 'every category gets its own color' },
	{ call: 'editor.app.topExpenses(3)', result: 'Monthly rent $1,200 · Supermarket $94.16 · $71.17' },
	{ call: 'pages["6104…"].modified', result: 'false — the CSV file was never touched' },
];

const REPLY = [
	'Your Budget viewer is ready — the default editor for every *.budget.csv file.',
	'• September comes to $2,390.28 over 30 expenses; Rent is the top category (50.2%).',
	'• The chart shows spending by category; the biggest expenses sit next to it.',
	'• Colors follow your app theme.',
	'• It never edits your files: Text Editor and Grid (CSV) are one click away.',
];

const STEP_EVERY = 40;

const scenes: SceneDef[] = [
	{ id: 'title', duration: 120, render: (d) => <TitleScene duration={d} /> },
	{ id: 'notepad', duration: 180, render: (d) => <NotepadScene duration={d} /> },
	{ id: 'editors', duration: 480, render: (d) => <EditorsScene duration={d} /> },
	{ id: 'workspaces', duration: 300, render: (d) => <WorkspacesScene duration={d} /> },
	{ id: 'shared', duration: 240, render: (d) => <SharedScene duration={d} /> },
	{ id: 'ask', duration: 210, render: (d) => <AskScene duration={d} /> },
	{ id: 'build', duration: Math.max(1, BUILD_STEPS.length) * STEP_EVERY + 90, render: (d) => <BuildScene duration={d} /> },
	{ id: 'result', duration: 560, render: (d) => <ResultScene duration={d} /> },
	{ id: 'end', duration: 150, render: (d) => <EndScene duration={d} /> },
];

export const PLATFORM_DURATION = totalDuration(scenes);

export const Platform = () => <ScenePlayer scenes={scenes} />;

// ---------------------------------------------------------------------------------------------

const TitleScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', fontFamily: sans }}>
			<Appear at={4}>
				<div style={{ color: palette.accent, fontSize: 34, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>Persephone</div>
			</Appear>
			<Appear at={14}>
				<div style={{ color: palette.text, fontSize: 88, fontWeight: 800, lineHeight: 1.08, marginTop: 18 }}>
					A notepad on the outside.
					<br />
					A platform on the inside.
				</div>
			</Appear>
			<Appear at={34}>
				<div style={{ color: palette.muted, fontSize: 36, marginTop: 36, maxWidth: 1150 }}>
					Every tab can be an app — and your AI agent works in the same window.
				</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

const NotepadScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[{ src: 'p-notepad.png', at: 0 }]}
			keys={[
				{ at: 0, ...FULL, scale: 0.98 },
				{ at: 40, ...FULL, scale: 0.98 },
				{ at: 110, x: 330, y: 200, scale: 1.7 },
				{ at: duration, x: 330, y: 200, scale: 1.75 },
			]}
		/>
		<Caption at={10} until={duration}>
			It opens like Notepad: tabs and plain text, nothing in the way.
		</Caption>
	</Scene>
);

/** A label naming the editor on screen, bottom left. */
const EditorTag = ({ at, until, name, note }: { at: number; until?: number; name: string; note: string }) => (
	<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 0 56px 56px' }}>
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

const SWITCH_README: Mark = { at: 40, until: 110, x: 1130, y: 46, w: 162, h: 27 };

const EditorsScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'p-ws-website.png', at: 0, marks: [SWITCH_README] },
				{ src: 'p-json-text.png', at: 120, marks: [{ at: 150, until: 240, x: 1100, y: 46, w: 192, h: 27 }] },
				{ src: 'p-json-grid.png', at: 240 },
				{ src: 'p-excalidraw.png', at: 360, marks: [{ at: 380, until: duration, x: 1110, y: 46, w: 184, h: 27 }] },
			]}
			keys={[
				{ at: 0, x: 648, y: 424, scale: 0.92 },
				{ at: duration, x: 648, y: 430, scale: 0.95 },
			]}
		/>
		<Caption top at={6} until={duration}>
			But a tab is more than text: each file opens in the editor that fits it.
		</Caption>
		<EditorTag at={20} until={118} name="Markdown preview" note="with Mermaid diagrams" />
		<EditorTag at={128} until={238} name="JSON as text…" note="Monaco, the editor inside VS Code" />
		<EditorTag at={248} until={358} name="…or as a grid" note="sort, filter, edit in place" />
		<EditorTag at={368} until={duration} name="Excalidraw" note="drawings, saved as plain files" />
	</Scene>
);

const WorkspacesScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{
					src: 'p-ws-website2.png',
					at: 0,
					marks: [
						{ at: 30, until: 140, x: 2, y: 78, w: 346, h: 22 },
						{ at: 30, until: 140, x: 250, y: 12, w: 206, h: 32 },
					],
				},
				{
					src: 'p-ws-budget.png',
					at: 150,
					marks: [
						{ at: 170, x: 2, y: 78, w: 346, h: 22 },
						{ at: 170, x: 458, y: 12, w: 206, h: 32 },
					],
				},
			]}
			keys={[
				{ at: 0, ...FULL, scale: 1.0 },
				{ at: 50, x: 500, y: 330, scale: 1.45 },
				{ at: duration, x: 500, y: 330, scale: 1.45 },
			]}
		/>
		<Caption at={10} until={145}>
			Open a folder as a tab: it becomes a workspace with its own file tree.
		</Caption>
		<Caption at={155} until={duration}>
			Several workspaces at once — one per tab. Switching is one click.
		</Caption>
	</Scene>
);

// ---------------------------------------------------------------------------------------------

const Party = ({ at, title, lines, color, wide }: { at: number; title: string; lines: string[]; color: string; wide?: boolean }) => {
	const pop = usePop(at);
	return (
		<div
			style={{
				transform: `scale(${pop})`,
				opacity: Math.min(1, pop * 1.5),
				width: wide ? 420 : 300,
				padding: '28px 26px',
				borderRadius: 22,
				background: palette.panel,
				border: `2px solid ${color}`,
				boxShadow: `0 0 60px ${color}33`,
				fontFamily: sans,
				textAlign: 'center',
			}}
		>
			<div style={{ fontSize: wide ? 46 : 40, fontWeight: 800, color: palette.text }}>{title}</div>
			{lines.map((line) => (
				<div key={line} style={{ fontSize: 23, color: palette.muted, marginTop: 8 }}>
					{line}
				</div>
			))}
		</div>
	);
};

/** A horizontal two-way link with a label above it. */
const Link2 = ({ at, label, color }: { at: number; label: string; color: string }) => {
	const frame = useCurrentFrame();
	const grow = tween(frame, [at, at + 18], [0, 1]);
	const flow = (frame * 1.2) % 22;
	return (
		<div style={{ width: 170, position: 'relative', height: 120, opacity: grow }}>
			<div style={{ position: 'absolute', top: 6, width: '100%', textAlign: 'center', fontFamily: sans, fontSize: 21, color }}>{label}</div>
			<div
				style={{
					position: 'absolute',
					top: 62,
					left: 0,
					height: 4,
					width: `${grow * 100}%`,
					backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 12px, transparent 12px 22px)`,
					backgroundPosition: `${flow}px 0`,
				}}
			/>
		</div>
	);
};

const SharedScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<Party at={10} title="You" lines={['click, type, read']} color={palette.accent2} />
				<Link2 at={40} label="the same tabs" color={palette.accent2} />
				<Party at={25} title="Persephone" lines={['tabs · files · editors', 'workspaces · boards']} color={palette.accent} wide />
				<Link2 at={70} label="MCP: call(path)" color={palette.orange} />
				<Party at={55} title="AI agent" lines={['sees, drives, builds']} color={palette.orange} />
			</div>
		</AbsoluteFill>
		<Caption at={90} until={duration}>
			And it is shared: your AI agent works in the same window you do.
		</Caption>
	</Scene>
);

const AskScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 100px' }}>
			<div style={{ width: 1240, display: 'flex', flexDirection: 'column', gap: 36 }}>
				<Appear at={0} dy={10}>
					<div style={{ fontFamily: sans, fontSize: 28, color: palette.muted, textAlign: 'center' }}>
						Need a viewer Persephone doesn’t have? Ask for one.
					</div>
				</Appear>
				<ChatBubble at={14} who="user" text={ASK} width={1080} charsPerFrame={2.2} />
				<div style={{ height: 70 }}>
					<Thinking at={130} until={duration} />
				</div>
			</div>
		</AbsoluteFill>
	</Scene>
);

const BuildScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ alignItems: 'center', paddingTop: 170 }}>
			<StepLog at={20} steps={BUILD_STEPS} every={STEP_EVERY} />
		</AbsoluteFill>
		<Caption top at={6} until={duration}>
			Claude builds a board: a small web app that works as an editor.
		</Caption>
	</Scene>
);

const ResultScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'p-ws-budget.png', at: 0 },
				{ src: 'p-budget-viewer.png', at: 40, marks: [{ at: 80, until: 220, x: 1054, y: 46, w: 240, h: 27 }] },
				{ src: 'p-budget-aug.png', at: 230, marks: [{ at: 250, until: 340, x: 2, y: 121, w: 346, h: 44 }] },
			]}
			keys={[
				{ at: 0, x: 648, y: 424, scale: 0.92 },
				{ at: duration, x: 648, y: 430, scale: 0.95 },
			]}
		/>
		<AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 80px 50px' }}>
			<ChatBubble at={345} who="agent" fontSize={26} width={1280} text={REPLY} />
		</AbsoluteFill>
		<Caption top at={10} until={220}>
			The same file, in its own viewer — next to the built-in editors.
		</Caption>
		<Caption top at={232} until={335}>
			Every *.budget.csv in the workspace now opens in it.
		</Caption>
	</Scene>
);

const EndScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: sans, textAlign: 'center' }}>
			<Appear at={4}>
				<div style={{ fontSize: 96, fontWeight: 800, color: palette.text }}>Persephone</div>
			</Appear>
			<Appear at={16}>
				<div style={{ fontSize: 36, color: palette.muted, marginTop: 24, lineHeight: 1.5 }}>
					Your notepad. Your workspaces.
					<br />
					Your own editors — <Code color={palette.orange}>built by asking.</Code>
				</div>
			</Appear>
			<Appear at={30}>
				<div style={{ fontSize: 30, color: palette.muted, marginTop: 40 }}>github.com/andriy-viyatyk/persephone</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);
