// The Site Extensions explainer: an animated diagram, no screenshots. It contrasts an agent that
// re-reads a whole page snapshot for every question with one that calls a small model a site
// extension exposes, shows the Trust bar, and ends on the benefits. See the recipe in video/README.md.
import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Appear, Caption, mono, palette, sans, Scene, ScenePlayer, SceneDef, totalDuration, tween } from '../kit';

const HOST = 'tracker.example.com';

// ── Diagram pieces ──────────────────────────────────────────────────────────────────────────────

const Box = ({ x, y, w, h, title, sub, color = palette.border, children }: {
	x: number; y: number; w: number; h: number; title: string; sub?: string; color?: string; children?: ReactNode;
}) => (
	<div
		style={{
			position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box',
			background: palette.panel, border: `2px solid ${color}`, borderRadius: 18, padding: '18px 22px',
			boxShadow: '0 20px 60px rgba(0,0,0,0.45)', fontFamily: sans, color: palette.text, overflow: 'hidden',
		}}
	>
		<div style={{ fontSize: 30, fontWeight: 700 }}>{title}</div>
		{sub && <div style={{ fontSize: 21, color: palette.muted, marginTop: 4 }}>{sub}</div>}
		{children}
	</div>
);

/** A horizontal arrow that draws itself from `at`, with a label above it. */
const Arrow = ({ x1, x2, y, at, label, color = palette.accent2, reverse = false }: {
	x1: number; x2: number; y: number; at: number; label?: ReactNode; color?: string; reverse?: boolean;
}) => {
	const frame = useCurrentFrame();
	const p = tween(frame, [at, at + 16], [0, 1]);
	const len = (x2 - x1) * p;
	const left = reverse ? x2 - len : x1;
	return (
		<>
			<div style={{ position: 'absolute', left, top: y - 2, width: len, height: 4, background: color, borderRadius: 2 }} />
			<div
				style={{
					position: 'absolute', top: y - 11, left: reverse ? left - 4 : left + len - 18, opacity: p > 0.95 ? 1 : 0,
					width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent',
					...(reverse ? { borderRight: `20px solid ${color}` } : { borderLeft: `20px solid ${color}` }),
				}}
			/>
			{label && (
				<div style={{ position: 'absolute', left: x1, width: x2 - x1, top: y - 50, textAlign: 'center', opacity: tween(frame, [at + 8, at + 20], [0, 1]) }}>
					<span style={{ fontFamily: mono, fontSize: 22, color, fontWeight: 600, background: palette.bg, padding: '2px 8px', borderRadius: 6 }}>{label}</span>
				</div>
			)}
		</>
	);
};

/** A live counter that runs from 0 to `to` between `at` and `until`. */
const Counter = ({ at, until, to, suffix, color }: { at: number; until: number; to: number; suffix: string; color: string }) => {
	const frame = useCurrentFrame();
	const value = Math.round(tween(frame, [at, until], [0, to]));
	return (
		<span style={{ fontFamily: mono, fontWeight: 700, color }}>
			{value.toLocaleString('en-US')} {suffix}
		</span>
	);
};

/** The generic web page: a header and rows of placeholder bars, no real content. */
const PageMock = ({ x, y, children }: { x: number; y: number; children?: ReactNode }) => (
	<Box x={x} y={y} w={430} h={560} title="Web page" sub={HOST}>
		<div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
			{[0.9, 0.7, 0.8, 0.6, 0.85, 0.75, 0.65].map((w, i) => (
				<div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
					<div style={{ width: 18, height: 18, borderRadius: 4, background: '#2a3557' }} />
					<div style={{ height: 14, width: `${w * 100}%`, borderRadius: 7, background: '#1e2847' }} />
				</div>
			))}
		</div>
		{children}
	</Box>
);

const Bubble = ({ at, until, children }: { at: number; until?: number; children: ReactNode }) => (
	<Appear at={at} until={until} style={{ position: 'absolute', left: 70, top: 740, width: 400 }}>
		<div style={{ fontFamily: sans, fontSize: 24, color: palette.text, background: '#1a2447', border: `1px solid ${palette.border}`, borderRadius: '18px 18px 18px 4px', padding: '14px 18px' }}>
			{children}
		</div>
	</Appear>
);

/** Snapshot text pouring from the page to the agent: generic accessibility-tree lines. */
const SnapshotFlood = ({ at }: { at: number }) => {
	const frame = useCurrentFrame();
	const lines = Array.from({ length: 40 }, (_, i) => `- listitem [ref=e${120 + i}]: row ${i + 1} · link · button · text…`);
	const scroll = tween(frame, [at, at + 150], [0, -620]);
	const opacity = tween(frame, [at, at + 10], [0, 1]);
	return (
		<div style={{ position: 'absolute', left: 90, top: 400, width: 360, height: 300, overflow: 'hidden', opacity, borderRadius: 12, border: `1px solid ${palette.red}55`, background: '#1a0f16' }}>
			<div style={{ transform: `translateY(${scroll}px)`, padding: 12 }}>
				{lines.map((l) => (
					<div key={l} style={{ fontFamily: mono, fontSize: 15, color: '#f3a6a6', lineHeight: '22px', whiteSpace: 'nowrap' }}>{l}</div>
				))}
			</div>
		</div>
	);
};

const Title = ({ children, at = 0 }: { children: ReactNode; at?: number }) => (
	<Appear at={at} style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center' }}>
		<div style={{ fontFamily: sans, fontSize: 46, fontWeight: 700, color: palette.text }}>{children}</div>
	</Appear>
);

// The three boxes share one layout in the "without" and "with" scenes.
const AGENT = { x: 70, y: 300, w: 400, h: 420 };
const MCP = { x: 560, y: 430, w: 320, h: 160 };
const PAGE = { x: 950, y: 300 };

const Diagram = ({ children, pageChildren }: { children?: ReactNode; pageChildren?: ReactNode }) => (
	<>
		<Box {...AGENT} title="AI agent" sub="your coding agent" />
		<Box {...MCP} title="Persephone" sub="MCP server · browser" color={palette.accent2} />
		<PageMock {...PAGE}>{pageChildren}</PageMock>
		{children}
	</>
);

// ── Scenes ──────────────────────────────────────────────────────────────────────────────────────

const Intro = ({ d }: { d: number }) => (
	<Scene duration={d}>
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: sans, textAlign: 'center' }}>
			<Appear at={6}>
				<div style={{ fontSize: 34, color: palette.accent, fontWeight: 600, letterSpacing: 1 }}>PERSEPHONE BROWSER</div>
			</Appear>
			<Appear at={14}>
				<div style={{ fontSize: 84, fontWeight: 800, color: palette.text, marginTop: 10 }}>Site Extensions</div>
			</Appear>
			<Appear at={28}>
				<div style={{ fontSize: 36, color: palette.muted, marginTop: 18 }}>Teach your agent a website once. Use it every day.</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

const Without = ({ d }: { d: number }) => {
	const frame = useCurrentFrame();
	const again = tween(frame, [235, 250], [0, 1]);
	return (
		<Scene duration={d}>
			<Title>Without an extension</Title>
			<Diagram>
				<Arrow x1={470} x2={560} y={480} at={40} />
				<Arrow x1={880} x2={950} y={480} at={52} label="snapshot()" />
				<Arrow x1={880} x2={950} y={560} at={70} color={palette.red} reverse />
				<Arrow x1={470} x2={560} y={560} at={80} color={palette.red} reverse />
				<Bubble at={14} until={95}>“Which tickets are new today?”</Bubble>
				<SnapshotFlood at={78} />
				<Appear at={90} style={{ position: 'absolute', left: 70, top: 740, width: 420, fontFamily: sans, fontSize: 26, color: palette.text }}>
					The whole page, up to <Counter at={90} until={200} to={18000} suffix="characters" color={palette.red} />
				</Appear>
				<div style={{ position: 'absolute', left: 70, top: 820, width: 420, fontFamily: sans, fontSize: 24, color: palette.orange, opacity: again }}>
					… and again for the next question, and tomorrow.
				</div>
			</Diagram>
			<Caption at={120}>The agent re-reads the whole page for every question</Caption>
		</Scene>
	);
};

const TrustBar = ({ at, pressAt }: { at: number; pressAt: number }) => {
	const frame = useCurrentFrame();
	const pressed = frame >= pressAt;
	const gone = tween(frame, [pressAt + 24, pressAt + 36], [1, 0]);
	return (
		<Appear at={at} style={{ position: 'absolute', left: PAGE.x, top: PAGE.y - 96, width: 430, opacity: gone }}>
			<div style={{ fontFamily: sans, fontSize: 19, color: palette.text, background: '#2a2410', border: `1px solid ${palette.orange}`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
				<div style={{ flex: 1 }}>Run “Tracker” on {HOST}?</div>
				<div style={{ background: pressed ? palette.green : palette.accent2, color: '#0b1020', fontWeight: 700, borderRadius: 8, padding: '6px 14px', transform: pressed && frame < pressAt + 8 ? 'scale(0.92)' : 'none' }}>
					{pressed ? 'Trusted' : 'Trust'}
				</div>
				<div style={{ color: palette.muted }}>Not now</div>
			</div>
		</Appear>
	);
};

const ExtensionChip = ({ at }: { at: number }) => (
	<Appear at={at} style={{ position: 'absolute', left: 22, right: 22, bottom: 22 }}>
		<div style={{ fontFamily: mono, fontSize: 20, color: palette.bg, background: palette.accent, borderRadius: 10, padding: '12px 16px', fontWeight: 700 }}>
			extension.js → app model
			<div style={{ fontFamily: sans, fontSize: 17, fontWeight: 600, marginTop: 4 }}>tickets · read(id) · open(id)</div>
		</div>
	</Appear>
);

const ModelResult = ({ at }: { at: number }) => (
	<Appear at={at} style={{ position: 'absolute', left: 90, top: 400, width: 380 }}>
		<div style={{ fontFamily: mono, fontSize: 16, lineHeight: '26px', color: '#a7f3d0', whiteSpace: 'pre', background: '#0e1f1d', border: `1px solid ${palette.accent}66`, borderRadius: 12, padding: '12px 16px' }}>
			{'['}<br />
			{'  { id: "T-142", status: "new" },'}<br />
			{'  { id: "T-139", status: "new" },'}<br />
			{'  { id: "T-137", status: "new" }'}<br />
			{']'}
		</div>
	</Appear>
);

const With = ({ d }: { d: number }) => (
	<Scene duration={d}>
		<Title>With a site extension</Title>
		<Diagram pageChildren={<ExtensionChip at={30} />}>
			<Caption at={20} until={150}>Your agent writes a small script for the site, once</Caption>
			<TrustBar at={70} pressAt={125} />
			<Caption at={155} until={250}>You trust it in the browser, for that host only</Caption>
			<Arrow x1={470} x2={560} y={480} at={200} color={palette.accent} />
			<Arrow x1={880} x2={950} y={480} at={212} label=".app.tickets" color={palette.accent} />
			<Arrow x1={880} x2={950} y={560} at={232} color={palette.green} reverse />
			<Arrow x1={470} x2={560} y={560} at={240} color={palette.green} reverse />
			<Bubble at={190} until={300}>“Which tickets are new today?”</Bubble>
			<ModelResult at={245} />
			<Appear at={260} style={{ position: 'absolute', left: 90, top: 590, width: 380, fontFamily: sans, fontSize: 24, color: palette.text }}>
				Just the answer: <Counter at={260} until={300} to={110} suffix="characters" color={palette.green} />
			</Appear>
			<Appear at={320} style={{ position: 'absolute', left: 90, top: 640, width: 360, fontFamily: sans, fontSize: 21, color: palette.muted }}>
				Page content only when it asks: <span style={{ fontFamily: mono, color: palette.accent }}>read("T-142")</span>
			</Appear>
			<Caption at={260}>The agent calls the model instead of reading the page</Caption>
		</Diagram>
	</Scene>
);

const BENEFITS: { title: string; note: string; color: string }[] = [
	{ title: 'Faster, cheaper answers', note: 'A small structured result instead of a page snapshot for every question.', color: palette.accent },
	{ title: 'Reliable', note: 'Stable ids and roles, not row positions that shift when the page changes.', color: palette.accent2 },
	{ title: 'Learned once, used daily', note: 'The extension stays in your site extensions folder and works in every new agent session.', color: palette.orange },
	{ title: 'You stay in control', note: 'Runs only after you trust it, per host. Never in Incognito or Tor pages.', color: palette.green },
];

const Benefits = ({ d }: { d: number }) => (
	<Scene duration={d}>
		<Title>Why it pays off for a site you use every day</Title>
		<div style={{ position: 'absolute', left: 110, right: 110, top: 260, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34 }}>
			{BENEFITS.map((b, i) => (
				<Appear key={b.title} at={18 + i * 30}>
					<div style={{ fontFamily: sans, background: palette.panel, border: `1px solid ${palette.border}`, borderLeft: `8px solid ${b.color}`, borderRadius: 16, padding: '30px 32px', height: 270, boxSizing: 'border-box' }}>
						<div style={{ fontSize: 36, fontWeight: 700, color: palette.text }}>{b.title}</div>
						<div style={{ fontSize: 27, color: palette.muted, marginTop: 14, lineHeight: 1.35 }}>{b.note}</div>
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
				<div style={{ fontSize: 64, fontWeight: 800, color: palette.text }}>Site Extensions</div>
			</Appear>
			<Appear at={14}>
				<div style={{ fontSize: 32, color: palette.muted, marginTop: 14 }}>Ask your agent: “build a site extension for this page”</div>
			</Appear>
		</AbsoluteFill>
	</Scene>
);

const scenes: SceneDef[] = [
	{ id: 'intro', duration: 120, render: (d) => <Intro d={d} /> },
	{ id: 'without', duration: 330, render: (d) => <Without d={d} /> },
	{ id: 'with', duration: 450, render: (d) => <With d={d} /> },
	{ id: 'benefits', duration: 330, render: (d) => <Benefits d={d} /> },
	{ id: 'outro', duration: 100, render: (d) => <Outro d={d} /> },
];

export const SITE_EXTENSIONS_DURATION = totalDuration(scenes);

export const SiteExtensions = () => <ScenePlayer scenes={scenes} />;
