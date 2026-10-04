// "Ask for an app, get a working one" — the Boards overview video.
// A real session: a separate Claude agent built the My Todo board in a clean 1296x968 Persephone
// window through the MCP `call` tool, then took a follow-up request. The chat text and the step log
// are that agent's own replies and tool calls, shortened; the screenshots are the board it made.
import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import {
	Appear,
	Caption,
	ChatBubble,
	Code,
	mono,
	palette,
	sans,
	Scene,
	ScenePlayer,
	ShotSequence,
	StepLog,
	Thinking,
	totalDuration,
	usePop,
	type SceneDef,
	type Step,
} from '../kit';

const ASK = 'Create a small todo board for me in Persephone. I want to add tasks, mark them done, and see how many are left.';

const FOLLOW_UP =
	'Looks great! Can you add priorities — High / Medium / Low with a colored tag on each task — and an optional due date? Show overdue tasks in red, and keep high-priority tasks at the top.';

const BUILD_STEPS: Step[] = [
	{ call: 'windows[3].guides.agents.boards', result: 'error: "guides" is a primitive value, has no member "agents"', error: true },
	{ call: 'guides.agents.boards   (windowIndex: 3)', result: 'the boards guide: create, open, page chrome, components catalog' },
	{ call: 'boards.createBoard("My Todo", "…\\boards")', result: 'scaffolded and trusted — every permission off' },
	{ call: 'fetch recommended-components catalog', result: 'SortableJS + its skin, vendored into lib/' },
	{ call: 'guides.agents["ai-vision"]', result: 'how to expose a .app model the agent can drive' },
	{ call: 'write index.html · style.css · app.js', result: 'add box, counter, progress bar, task list, .app model' },
	{ call: 'boards.openBoard("…\\My Todo")', result: 'opened as pages[1] "My Todo", active' },
	{ call: 'pages[1].editor.app', result: 'MyTodoApp { total: 0, remaining: 0, filter: "all" }' },
	{ call: 'editor.app.addTask("Write release notes")  ×5', result: '5 tasks added — the board updates live' },
	{ call: 'editor.app.toggleTask("mutlzbj06oho")', result: 'true: "Review pull requests" is done' },
	{ call: 'editor.click(".task:nth-child(4) input")', result: 'a real click: 4 left → 3, then restored' },
	{ call: 'editor.screenshot()', result: '5 tasks, one struck through, "4 tasks left · 1 of 5 done"' },
];

const FOLLOW_UP_STEPS: Step[] = [
	{ call: 'edit index.html · style.css · app.js', result: 'priority picker, due date, colored tags, overdue style, sorting' },
	{ call: 'pages[1].editor.reload()', result: 'refreshed: true, board still trusted' },
	{ call: 'editor.app.items', result: '5 tasks survived the reload, all "medium"' },
	{ call: 'editor.app.setPriority("mutlzb2sb2n6", "high")', result: 'true: "Write release notes" is High' },
	{ call: 'editor.app.setDue("mutlzb2sb2n6", "2026-10-03")', result: 'true: overdue as of today' },
	{ call: 'editor.app.setPriority / setDue  ×5', result: 'docs site High, due tomorrow · sprint due today' },
	{ call: 'editor.click(".task:nth-child(5) .prio")', result: 'Low → High: the task jumps into the top group' },
	{ call: 'editor.app.setPriority("mutlzcwit9n7", "low")', result: 'example data restored' },
	{ call: 'editor.screenshot()', result: '"4 tasks left · 1 of 5 done · 1 overdue"' },
];

const STEP_EVERY = 40;

const scenes: SceneDef[] = [
	{ id: 'title', duration: 120, render: (d) => <TitleScene duration={d} /> },
	{ id: 'ask', duration: 180, render: (d) => <AskScene duration={d} /> },
	{ id: 'build', duration: BUILD_STEPS.length * STEP_EVERY + 90, render: (d) => <BuildScene duration={d} /> },
	{ id: 'result', duration: 420, render: (d) => <ResultScene duration={d} /> },
	{ id: 'follow-up', duration: 200, render: (d) => <FollowUpScene duration={d} /> },
	{ id: 'rebuild', duration: FOLLOW_UP_STEPS.length * STEP_EVERY + 80, render: (d) => <RebuildScene duration={d} /> },
	{ id: 'result-2', duration: 450, render: (d) => <SecondResultScene duration={d} /> },
	{ id: 'end', duration: 150, render: (d) => <EndScene duration={d} /> },
];

export const BOARDS_TODO_DURATION = totalDuration(scenes);

export const BoardsTodo = () => <ScenePlayer scenes={scenes} />;

const Column = ({ children, justify = 'center' }: { children: ReactNode; justify?: 'center' | 'flex-start' }) => (
	<AbsoluteFill style={{ justifyContent: justify, alignItems: 'center', padding: '0 100px' }}>
		<div style={{ width: 1240, display: 'flex', flexDirection: 'column', gap: 36 }}>{children}</div>
	</AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------

const TitleScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', fontFamily: sans }}>
			<Appear at={4}>
				<div style={{ color: palette.accent, fontSize: 34, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
					Persephone boards
				</div>
			</Appear>
			<Appear at={14}>
				<div style={{ color: palette.text, fontSize: 92, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>
					Ask for an app.
					<br />
					Get one that works.
				</div>
			</Appear>
			<Appear at={34}>
				<div style={{ color: palette.muted, fontSize: 36, marginTop: 36, maxWidth: 1150 }}>
					A real session: Claude builds a todo board, tests it, then improves it on request.
				</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

const AskScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<Column>
			<ChatBubble at={10} who="user" text={ASK} width={1000} charsPerFrame={1.5} />
			<div style={{ height: 70 }}>
				<Thinking at={110} until={duration} />
			</div>
		</Column>
	</Scene>
);

const FILES = ['index.html', 'style.css', 'app.js', 'lib/Sortable.min.js', 'board-manifest.json', 'CLAUDE.md'];

/** The board folder filling up: chips pop in from `at`. */
const FolderChips = ({ at }: { at: number }) => (
	<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
		<Appear at={at} dy={10}>
			<span style={{ fontFamily: sans, fontSize: 24, color: palette.muted, marginRight: 6 }}>📁 My Todo/</span>
		</Appear>
		{FILES.map((file, i) => (
			<Chip key={file} at={at + 6 + i * 6} text={file} />
		))}
	</div>
);

const Chip = ({ at, text }: { at: number; text: string }) => {
	const pop = usePop(at);
	return (
		<span
			style={{
				fontFamily: mono,
				fontSize: 19,
				color: palette.text,
				background: palette.panel,
				border: `1px solid ${palette.border}`,
				borderRadius: 10,
				padding: '7px 11px',
				transform: `scale(${pop})`,
				opacity: Math.min(1, pop * 2),
			}}
		>
			{text}
		</span>
	);
};

const BuildScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ alignItems: 'center', paddingTop: 170 }}>
			<div style={{ width: 1240, display: 'flex', flexDirection: 'column', gap: 30 }}>
				<StepLog at={20} steps={BUILD_STEPS} every={STEP_EVERY} />
				<FolderChips at={20 + 5 * STEP_EVERY} />
			</div>
		</AbsoluteFill>
		<Caption top at={6} until={20 + 2 * STEP_EVERY}>
			It reads the boards guide first — and corrects its own wrong path.
		</Caption>
		<Caption top at={30 + 2 * STEP_EVERY} until={20 + 6 * STEP_EVERY}>
			It creates the board folder and writes the app.
		</Caption>
		<Caption top at={30 + 6 * STEP_EVERY} until={duration}>
			Then it opens the board and tests it — through its model and real clicks.
		</Caption>
	</Scene>
);

const SHOT_LIST = { x: 648, y: 360, scale: 1.5 };

const ResultScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{
					src: 'todo-1.png',
					at: 0,
					marks: [
						{ at: 70, x: 298, y: 160, w: 172, h: 26 },
						{ at: 100, x: 304, y: 243, w: 688, h: 34 },
					],
				},
			]}
			keys={[
				{ at: 0, x: 648, y: 484, scale: 0.98 },
				{ at: 30, x: 648, y: 484, scale: 0.98 },
				{ at: 70, ...SHOT_LIST },
				{ at: duration, ...SHOT_LIST, scale: 1.55 },
			]}
		/>
		<AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 80px 50px' }}>
			<ChatBubble
				at={140}
				who="agent"
				fontSize={26}
				width={1280}
				text={[
					'Your My Todo board is open — five example tasks, one already done.',
					'• Type a task and press Enter (or click Add).',
					'• Click a task to mark it done; drag the ⋮⋮ handle to reorder.',
					'• The counter shows how many are left, with a progress bar.',
					'• Tasks are saved with the board, so they survive a restart.',
				]}
			/>
		</AbsoluteFill>
		<Caption top at={10} until={130}>
			The result: a working board, already tested.
		</Caption>
	</Scene>
);

const FollowUpScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<Column>
			<ChatBubble at={10} who="user" text={FOLLOW_UP} width={1060} charsPerFrame={2.2} />
			<div style={{ height: 70 }}>
				<Thinking at={120} until={duration} />
			</div>
		</Column>
	</Scene>
);

const RebuildScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ alignItems: 'center', paddingTop: 170 }}>
			<StepLog at={20} steps={FOLLOW_UP_STEPS} every={STEP_EVERY} />
		</AbsoluteFill>
		<Caption top at={6} until={20 + 3 * STEP_EVERY}>
			Same conversation: it edits the board and reloads it. The tasks survive.
		</Caption>
		<Caption top at={30 + 3 * STEP_EVERY} until={duration}>
			It sets example priorities and dates, then checks the result.
		</Caption>
	</Scene>
);

const SecondResultScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<ShotSequence
			shots={[
				{ src: 'todo-1.png', at: 0 },
				{
					src: 'todo-2.png',
					at: 40,
					marks: [
						{ at: 80, until: 150, x: 352, y: 204, w: 70, h: 178 },
						{ at: 150, until: 220, x: 302, y: 203, w: 692, h: 38 },
						{ at: 220, x: 468, y: 160, w: 80, h: 26 },
					],
				},
			]}
			keys={[
				{ at: 0, ...SHOT_LIST },
				{ at: duration, ...SHOT_LIST, scale: 1.58 },
			]}
		/>
		<AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 80px 50px' }}>
			<ChatBubble
				at={220}
				who="agent"
				fontSize={26}
				width={1280}
				text={[
					'My Todo now has priorities and due dates.',
					'• Every task has a High / Medium / Low tag — click it to change. High stays on top.',
					'• The add row has a priority picker and an optional due date.',
					'• Overdue tasks turn red and are counted; today and tomorrow show in amber.',
					'• Your existing tasks were kept.',
				]}
			/>
		</AbsoluteFill>
		<Caption top at={10} until={210}>
			Before → after: colored priority tags, due dates, overdue in red.
		</Caption>
	</Scene>
);

// ---------------------------------------------------------------------------------------------

const EndScene = ({ duration }: { duration: number }) => (
	<Scene duration={duration}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: sans, textAlign: 'center' }}>
			<Appear at={4}>
				<div style={{ fontSize: 96, fontWeight: 800, color: palette.text }}>Boards</div>
			</Appear>
			<Appear at={16}>
				<div style={{ fontSize: 38, color: palette.muted, marginTop: 24 }}>
					A folder with an <Code>index.html</Code> is a working app.
				</div>
			</Appear>
			<Appear at={30}>
				<div style={{ fontSize: 30, color: palette.muted, marginTop: 40 }}>github.com/andriy-viyatyk/persephone</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);
