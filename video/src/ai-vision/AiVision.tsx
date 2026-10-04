// "How an AI agent sees Persephone" — the ai-vision overview video.
// Screenshots in public/ were taken from a clean 1296x968 Persephone window through the MCP `call`
// tool; the terminal text is real `call` output, shortened.
import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
	Appear,
	BottomRight,
	Caption,
	Code,
	FULL,
	mono,
	palette,
	sans,
	Scene,
	ScenePlayer,
	ShotSequence,
	Swap,
	Terminal,
	totalDuration,
	tween,
	usePop,
	type SceneDef,
	type TermLine,
} from '../kit';

const scenes: SceneDef[] = [
	{ id: 'title', duration: 120, render: (d) => <TitleScene duration={d} /> },
	{ id: 'one-tool', duration: 300, render: (d) => <OneToolScene duration={d} /> },
	{ id: 'paths', duration: 270, render: (d) => <PathsScene duration={d} /> },
	{ id: 'board', duration: 450, render: (d) => <BoardScene duration={d} /> },
	{ id: 'web', duration: 360, render: (d) => <WebScene duration={d} /> },
	{ id: 'errors', duration: 300, render: (d) => <ErrorsScene duration={d} /> },
	{ id: 'architecture', duration: 360, render: (d) => <ArchitectureScene duration={d} /> },
	{ id: 'end', duration: 150, render: (d) => <EndScene duration={d} /> },
];

export const AI_VISION_DURATION = totalDuration(scenes);

export const AiVision = () => <ScenePlayer scenes={scenes} />;

// ---------------------------------------------------------------------------------------------

const TitleScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', fontFamily: sans }}>
			<Appear at={4}>
				<div style={{ color: palette.accent, fontSize: 34, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
					ai-vision
				</div>
			</Appear>
			<Appear at={14}>
				<div style={{ color: palette.text, fontSize: 92, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>
					How an AI agent
					<br />
					sees Persephone
				</div>
			</Appear>
			<Appear at={34}>
				<div style={{ color: palette.muted, fontSize: 38, marginTop: 36, maxWidth: 1100 }}>
					One tool. Named paths. Every answer says where to go next.
				</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

// ---------------------------------------------------------------------------------------------

const Node = ({ at, label, sub, color }: { at: number; label: string; sub: string; color: string }) => {
	const pop = usePop(at);
	return (
		<div
			style={{
				transform: `scale(${pop})`,
				opacity: pop,
				width: 330,
				padding: '26px 28px',
				borderRadius: 20,
				background: palette.panel,
				border: `2px solid ${color}`,
				fontFamily: sans,
				textAlign: 'center',
				boxShadow: `0 0 50px ${color}33`,
			}}
		>
			<div style={{ fontSize: 40, fontWeight: 800, color: palette.text }}>{label}</div>
			<div style={{ fontSize: 22, color: palette.muted, marginTop: 6 }}>{sub}</div>
		</div>
	);
};

const Arrow = ({ at, label, width = 300 }: { at: number; label: ReactNode; width?: number }) => {
	const frame = useCurrentFrame();
	const grow = tween(frame, [at, at + 18], [0, 1]);
	return (
		<div style={{ width, position: 'relative', height: 90 }}>
			<div style={{ position: 'absolute', top: 0, width: '100%', textAlign: 'center', opacity: grow, fontSize: 30 }}>{label}</div>
			<div
				style={{
					position: 'absolute',
					top: 56,
					left: 0,
					height: 4,
					width: `${grow * 100}%`,
					background: palette.accent,
					borderRadius: 2,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 47,
					left: `calc(${grow * 100}% - 14px)`,
					opacity: grow,
					width: 0,
					height: 0,
					borderTop: '11px solid transparent',
					borderBottom: '11px solid transparent',
					borderLeft: `18px solid ${palette.accent}`,
				}}
			/>
		</div>
	);
};

const rootLines: TermLine[] = [
	{ text: '{ "kind": "Persephone", "version": "5.0.7", "pageCount": 2 }', color: palette.text },
	{ text: '--- hint (Persephone) ---', color: palette.accent2 },
	{ text: 'Persephone — the root of the object model.' },
	{ text: 'children (live):', color: palette.text },
	{ text: '  pages — 2 open page(s)' },
	{ text: 'members:', color: palette.text },
	{ text: '  pages — All open pages (tabs) in this window' },
	{ text: '  boards — sandboxed mini web-apps' },
	{ text: '  ui — dialogs, notifications, on-screen controls' },
	{ text: '  fs — file system access   [CAUTION]' },
	{ text: '  helpSearch(query) — search the live model' },
	{ text: '  … 19 more' },
];

const OneToolScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ alignItems: 'center', paddingTop: 110, fontFamily: sans, color: palette.text }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
				<Node at={6} label="AI agent" sub="any MCP client" color={palette.accent2} />
				<Arrow at={22} label={<Code>call(path)</Code>} />
				<Node at={30} label="Persephone" sub="one MCP tool" color={palette.accent} />
			</div>
			<Terminal at={70} command='call()' lines={rootLines} width={1040} fontSize={25} style={{ marginTop: 60 }} />
		</AbsoluteFill>
		<Caption at={60} until={duration}>
			One <Code>call</Code> tool. The agent starts with an empty path.
		</Caption>
	</Scene>
);

// ---------------------------------------------------------------------------------------------

const segments: { text: string; kind: string; remote?: boolean }[] = [
	{ text: 'pages', kind: 'Pages' },
	{ text: '[0]', kind: 'Page · launch.todo.json' },
	{ text: '.editor', kind: 'BoardEditor' },
	{ text: '.app', kind: 'TodoApp', remote: true },
	{ text: '.items', kind: 'TodoItems' },
];

const PathsScene = ({ duration }: { duration: number }) => {
	const frame = useCurrentFrame();
	return (
		<Scene duration={duration}>
			<AbsoluteFill style={{ alignItems: 'center', paddingTop: 150, fontFamily: sans }}>
				<Appear at={4}>
					<div style={{ color: palette.muted, fontSize: 30, marginBottom: 40, textAlign: 'center' }}>
						Each step answers with a <b style={{ color: palette.text }}>hint</b>: what is here, and where to go next
					</div>
				</Appear>
				<div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
					{segments.map((s, i) => {
						const at = 24 + i * 26;
						const shown = tween(frame, [at, at + 10], [0, 1]);
						const lift = tween(frame, [at, at + 12], [30, 0]);
						const color = s.remote ? palette.orange : palette.accent;
						return (
							<div key={s.text} style={{ opacity: shown, transform: `translateY(${lift}px)`, textAlign: 'center' }}>
								<div
									style={{
										fontFamily: mono,
										fontSize: 52,
										fontWeight: 700,
										color,
										padding: '14px 10px',
										borderBottom: `4px solid ${color}`,
									}}
								>
									{s.text}
								</div>
								<div style={{ fontSize: 22, color: palette.muted, marginTop: 14, maxWidth: 220, lineHeight: 1.3 }}>
									{s.kind}
								</div>
								{s.remote ? (
									<div style={{ fontSize: 20, color: palette.orange, marginTop: 6, fontWeight: 600 }}>lives in the board ↗</div>
								) : null}
							</div>
						);
					})}
				</div>
				<Terminal
					at={170}
					command='call("pages")'
					width={1100}
					fontSize={24}
					style={{ marginTop: 64 }}
					lines={[
						{ text: '{ "kind": "Pages", "count": 2 }', color: palette.text },
						{ text: 'children (live):', color: palette.text },
						{ text: '  pages[0] — Page: "launch.todo.json" (board-editor: todo)' },
						{ text: '  pages[1] — Page: "Browser (agent)" (browser-view)' },
					]}
				/>
			</AbsoluteFill>
			<Caption at={150} until={duration}>
				The agent reads only the branch the task needs.
			</Caption>
		</Scene>
	);
};

// ---------------------------------------------------------------------------------------------

const BoardScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'win-1-before.png', at: 0 },
				{ src: 'win-2-highlight.png', at: 228 },
				{ src: 'win-3-after.png', at: 342, marks: [{ at: 365, x: 360, y: 318, w: 900, h: 52 }] },
			]}
			keys={[
				{ at: 0, ...FULL, scale: 0.98 },
				{ at: 50, ...FULL, scale: 0.98 },
				{ at: 80, x: 648, y: 430, scale: 1.1 },
				{ at: 210, x: 648, y: 430, scale: 1.1 },
				{ at: 240, x: 560, y: 330, scale: 1.4 },
				{ at: 330, x: 560, y: 330, scale: 1.4 },
				{ at: 352, x: 640, y: 420, scale: 1.3 },
				{ at: duration, x: 640, y: 420, scale: 1.34 },
			]}
		/>
		<BottomRight>
			<Swap from={70} until={214}>
				<Terminal
					at={70}
					command='call("pages[0].editor.app")'
					width={760}
					fontSize={21}
					lineEvery={2}
					lines={[
						{ text: '{ "kind": "TodoApp", "lists": 1, "items": 4 }', color: palette.text },
						{ text: "TodoApp — the Todo board's live object model", color: palette.accent2 },
						{ text: 'members:', color: palette.text },
						{ text: '  items — the filtered, ordered items' },
						{ text: '  selectedList — the selected list [writable]' },
						{ text: '  addItem(title, list?)' },
						{ text: '  toggleItem(id) · setItemTag(id, tag)' },
						{ text: '  highlight(name, message?)' },
					]}
				/>
			</Swap>
			<Swap from={214} until={330}>
				<Terminal
					at={214}
					command='call("pages[0].editor.app.highlight", ["quick-add-input", "Type a title here…"])'
					width={760}
					fontSize={21}
					charsPerFrame={3}
					lines={[{ text: '{ "found": true, "highlighted": 1 }', color: palette.green }]}
				/>
			</Swap>
			<Swap from={330}>
				<Terminal
					at={330}
					command='call("pages[0].editor.app.addItem", ["Make the ai-vision video"])'
					width={760}
					fontSize={21}
					charsPerFrame={3}
					lines={[{ text: '"b03e780d-eb9f-4060-90ea-ed17c7b85321"', color: palette.green }]}
				/>
			</Swap>
		</BottomRight>
		<Caption top at={10} until={205}>
			A board is a small web app. It exposes its own model with ai-vision.
		</Caption>
		<Caption top at={214} until={326}>
			The agent can point at the board's own controls…
		</Caption>
		<Caption top at={336} until={duration}>
			…and drive it. Persephone forwards the call; the board updates live.
		</Caption>
	</Scene>
);

// ---------------------------------------------------------------------------------------------

const WebScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'web-1.png', at: 0 },
				{ src: 'web-2.png', at: 236 },
			]}
			keys={[
				{ at: 0, ...FULL, scale: 0.98 },
				{ at: 50, ...FULL, scale: 0.98 },
				{ at: 80, x: 648, y: 520, scale: 1.1 },
				{ at: 226, x: 648, y: 520, scale: 1.1 },
				{ at: 246, x: 648, y: 540, scale: 1.12 },
				{ at: duration, x: 648, y: 540, scale: 1.16 },
			]}
		/>
		<BottomRight>
			<Swap from={70} until={220}>
				<Terminal
					at={70}
					command='call("pages[1].editor.app")'
					width={800}
					fontSize={21}
					lineEvery={2}
					lines={[
						{ text: '{ "filterStatus": "all", "totalItems": 3 }', color: palette.text },
						{ text: 'page:DemoApp — [Page-authored data]', color: palette.orange },
						{ text: '  A small task list with filters and controls.' },
						{ text: 'members:', color: palette.text },
						{ text: '  filterText [writable] · items · addItem(title, tag?)' },
						{ text: '  toggleItem(id) · clearDone() · highlight(name, message?)' },
					]}
				/>
			</Swap>
			<Swap from={220}>
				<Terminal
					at={220}
					command='call("pages[1].editor.app.addItem", ["Explain how ai-vision works", "video"])'
					width={800}
					fontSize={21}
					charsPerFrame={3}
					lines={[{ text: '{ "id": 4, "title": "Explain how ai-vision works" }', color: palette.green }]}
				/>
			</Swap>
		</BottomRight>
		<Caption top at={10} until={210}>
			A web page — or a site extension — does the same with <Code>expose(model)</Code>.
		</Caption>
		<Caption top at={220} until={duration}>
			Labeled as page-authored data, driven with the same paths.
		</Caption>
	</Scene>
);

// ---------------------------------------------------------------------------------------------

const ErrorsScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ alignItems: 'center', paddingTop: 70, gap: 30 }}>
			<Terminal
				at={10}
				command='call("boards.open", ["…/todo"])'
				width={1260}
				fontSize={24}
				lineEvery={4}
				lines={[
					{ text: 'Error: "open" is not a member of Boards.', color: palette.red, bold: true },
					{ text: 'members:', color: palette.text },
					{ text: '  openBoard(boardRoot) — Open an existing board in a new or reused tab.' },
					{ text: '  createBoard(name, dir) · list() · searchPublished(query?) …' },
				]}
			/>
			<Terminal
				at={110}
				command='call("pages[0].editor.app.setTagColor", ["docs", "#3b82f6"])'
				title="agent → call → board"
				width={1260}
				fontSize={24}
				charsPerFrame={2.4}
				lineEvery={4}
				lines={[
					{ text: 'Error: Invalid color "#3b82f6". Use setTagColor with "" or one of:', color: palette.red, bold: true },
					{ text: '  dodgerblue, hotpink, olive, mediumpurple, orange, tomato, …' },
				]}
			/>
			<Terminal
				at={200}
				command='call("pages[0].editor.app.setTagColor", ["docs", "dodgerblue"])'
				title="agent → call → board"
				width={1260}
				fontSize={24}
				charsPerFrame={2.4}
				lines={[{ text: '"dodgerblue"   ✓', color: palette.green, bold: true }]}
			/>
		</AbsoluteFill>
		<Caption at={30} until={duration}>
			A wrong path teaches the right one — in Persephone and inside a board.
		</Caption>
	</Scene>
);

// ---------------------------------------------------------------------------------------------

const Box = ({
	at,
	x,
	y,
	w,
	h,
	color,
	title,
	children,
	dashed,
}: {
	at: number;
	x: number;
	y: number;
	w: number;
	h: number;
	color: string;
	title: string;
	children?: ReactNode;
	dashed?: boolean;
}) => {
	const pop = usePop(at);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				opacity: Math.min(1, pop),
				transform: `scale(${0.9 + 0.1 * pop})`,
				border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
				borderRadius: 20,
				background: palette.panel,
				padding: '18px 22px',
				boxSizing: 'border-box',
				fontFamily: sans,
				color: palette.text,
				boxShadow: `0 0 60px ${color}22`,
			}}
		>
			<div style={{ fontSize: 28, fontWeight: 800, color }}>{title}</div>
			{children}
		</div>
	);
};

const TreeRow = ({ at, depth, text, color = palette.text }: { at: number; depth: number; text: string; color?: string }) => (
	<Appear at={at} dy={10}>
		<div style={{ fontFamily: mono, fontSize: 24, color, paddingLeft: depth * 30, lineHeight: 1.7 }}>
			{depth > 0 ? <span style={{ color: palette.border }}>└ </span> : null}
			{text}
		</div>
	</Appear>
);

/** A dashed connector drawn from (x1,y1) to (x2,y2) once `at` is reached, with a label. */
const Link = ({
	at,
	x1,
	y1,
	x2,
	y2,
	label,
	color = palette.orange,
}: {
	at: number;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	label: string;
	color?: string;
}) => {
	const frame = useCurrentFrame();
	const drawn = tween(frame, [at, at + 22], [0, 1]);
	const flow = (frame * 1.5) % 24;
	return (
		<svg style={{ position: 'absolute', inset: 0, width: 1440, height: 1080, overflow: 'visible' }}>
			<line
				x1={x1}
				y1={y1}
				x2={x1 + (x2 - x1) * drawn}
				y2={y1 + (y2 - y1) * drawn}
				stroke={color}
				strokeWidth={4}
				strokeDasharray="12 12"
				strokeDashoffset={-flow}
			/>
			<text
				x={x1 - 10}
				y={y1 + (y1 < y2 ? -16 : 34)}
				fill={color}
				fontFamily={sans}
				fontSize={22}
				fontWeight={600}
				textAnchor="end"
				opacity={tween(frame, [at + 14, at + 24], [0, 1])}
			>
				{label}
			</text>
		</svg>
	);
};

const ArchitectureScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill>
			<Appear at={4}>
				<div style={{ fontFamily: sans, fontSize: 46, fontWeight: 800, color: palette.text, textAlign: 'center', marginTop: 60 }}>
					One object model, many apps
				</div>
			</Appear>
			<Box at={14} x={60} y={250} w={250} h={150} color={palette.accent2} title="AI agent">
				<div style={{ fontFamily: mono, fontSize: 22, color: palette.muted, marginTop: 14 }}>call(path)</div>
			</Box>
			<Box at={24} x={380} y={200} w={560} h={420} color={palette.accent} title="Persephone · ai-vision host">
				<div style={{ marginTop: 16 }}>
					<TreeRow at={40} depth={0} text="root" color={palette.accent} />
					<TreeRow at={48} depth={1} text="pages" />
					<TreeRow at={56} depth={2} text="[0].editor.app" color={palette.orange} />
					<TreeRow at={64} depth={2} text="[1].editor.app" color={palette.orange} />
					<TreeRow at={72} depth={1} text="boards · ui · fs" />
					<TreeRow at={80} depth={1} text="helpSearch(query)" />
					<TreeRow at={88} depth={1} text="… windows · main" />
				</div>
			</Box>
			<Box at={120} x={1040} y={230} w={350} h={180} color={palette.orange} title="Board" dashed>
				<div style={{ fontSize: 22, color: palette.muted, marginTop: 8 }}>sandboxed iframe</div>
				<div style={{ fontFamily: mono, fontSize: 22, color: palette.text, marginTop: 8 }}>expose(model)</div>
			</Box>
			<Box at={150} x={1040} y={460} w={350} h={180} color={palette.orange} title="Web page" dashed>
				<div style={{ fontSize: 22, color: palette.muted, marginTop: 8 }}>or a site extension</div>
				<div style={{ fontFamily: mono, fontSize: 22, color: palette.text, marginTop: 8 }}>expose(model)</div>
			</Box>
			<Link at={30} x1={310} y1={325} x2={380} y2={325} label="" color={palette.accent2} />
			<Link at={130} x1={1040} y1={320} x2={705} y2={375} label="shape" />
			<Link at={160} x1={1040} y1={550} x2={705} y2={415} label="shape" />
		</AbsoluteFill>
		<Caption at={200} until={duration}>
			One resolver on the host. Only the model's shape crosses over.
		</Caption>
	</Scene>
);

// ---------------------------------------------------------------------------------------------

const EndScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: sans, textAlign: 'center' }}>
			<Appear at={4}>
				<div style={{ fontSize: 96, fontWeight: 800, color: palette.text }}>ai-vision</div>
			</Appear>
			<Appear at={16}>
				<div
					style={{
						fontFamily: mono,
						fontSize: 40,
						color: palette.accent,
						marginTop: 28,
						padding: '14px 30px',
						border: `1px solid ${palette.border}`,
						borderRadius: 12,
						background: palette.panel,
					}}
				>
					npm install ai-vision
				</div>
			</Appear>
			<Appear at={28}>
				<div style={{ fontSize: 30, color: palette.muted, marginTop: 30 }}>github.com/andriy-viyatyk/ai-vision</div>
			</Appear>
			<Appear at={40}>
				<div style={{ fontSize: 26, color: palette.muted, marginTop: 14 }}>Built for Persephone · MIT</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);
