// Building blocks shared by the site videos: palette, fades, captions, a typing terminal and a
// screenshot "camera" that pans and zooms between keyframes.
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const palette = {
	bg: '#0b1020',
	bg2: '#131a33',
	panel: '#0f1629',
	border: '#2a3557',
	text: '#e6ebf5',
	muted: '#8d99b8',
	accent: '#2dd4bf',
	accent2: '#7c9cff',
	orange: '#fb923c',
	red: '#f87171',
	green: '#4ade80',
};

export const sans = '"Segoe UI", "Inter", system-ui, sans-serif';
export const mono = '"Cascadia Mono", "Cascadia Code", Consolas, monospace';

const ease = Easing.bezier(0.45, 0, 0.2, 1);

/** Interpolates with clamping and a smooth ease, the default for every animated value here. */
export const tween = (frame: number, input: number[], output: number[]) =>
	interpolate(frame, input, output, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

/** Opacity for a scene that fades in over `fade` frames and out at its end. */
export const sceneOpacity = (frame: number, duration: number, fade = 12) =>
	tween(frame, [0, fade, duration - fade, duration], [0, 1, 1, 0]);

export const Background = () => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at 20% 0%, #1b2752 0%, ${palette.bg} 55%), ${palette.bg}`,
		}}
	/>
);

/** Fades and slides children in at `at` and out at `until` (frames relative to the scene). */
export const Appear = ({
	at,
	until,
	children,
	dy = 24,
	style,
}: {
	at: number;
	until?: number;
	children: ReactNode;
	dy?: number;
	style?: CSSProperties;
}) => {
	const frame = useCurrentFrame();
	const fadeIn = tween(frame, [at, at + 12], [0, 1]);
	const fadeOut = until === undefined ? 1 : tween(frame, [until - 10, until], [1, 0]);
	const offset = tween(frame, [at, at + 14], [dy, 0]);
	return <div style={{ opacity: fadeIn * fadeOut, transform: `translateY(${offset}px)`, ...style }}>{children}</div>;
};

/** Lower-third caption pill. */
export const Caption = ({
	at,
	until,
	top,
	children,
}: {
	at: number;
	until?: number;
	top?: boolean;
	children: ReactNode;
}) => (
	<AbsoluteFill
		style={{
			justifyContent: top ? 'flex-start' : 'flex-end',
			alignItems: 'center',
			padding: '44px 0 54px',
			pointerEvents: 'none',
		}}
	>
		<Appear at={at} until={until}>
			<div
				style={{
					fontFamily: sans,
					fontSize: 34,
					fontWeight: 600,
					color: palette.text,
					background: 'rgba(11,16,32,0.88)',
					border: `1px solid ${palette.border}`,
					borderLeft: `6px solid ${palette.accent}`,
					borderRadius: 14,
					padding: '18px 30px',
					maxWidth: 1240,
					boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
				}}
			>
				{children}
			</div>
		</Appear>
	</AbsoluteFill>
);

export type TermLine = { text: string; color?: string; bold?: boolean };

/**
 * A terminal panel: the command is typed from `at`, then output lines appear one by one.
 * `command` is shown after a prompt; output lines may be colored.
 */
export const Terminal = ({
	at,
	command,
	lines,
	title = 'agent → call',
	width = 900,
	fontSize = 24,
	charsPerFrame = 1.6,
	lineEvery = 3,
	style,
}: {
	at: number;
	command: string;
	lines: TermLine[];
	title?: string;
	width?: number;
	fontSize?: number;
	charsPerFrame?: number;
	lineEvery?: number;
	style?: CSSProperties;
}) => {
	const frame = useCurrentFrame() - at;
	const typed = Math.max(0, Math.min(command.length, Math.floor(frame * charsPerFrame)));
	const typingDone = Math.ceil(command.length / charsPerFrame) + 6;
	const shownLines = Math.max(0, Math.floor((frame - typingDone) / lineEvery) + 1);
	const cursorOn = Math.floor(frame / 8) % 2 === 0;
	return (
		<div
			style={{
				width,
				background: 'rgba(10,14,28,0.96)',
				border: `1px solid ${palette.border}`,
				borderRadius: 16,
				boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
				overflow: 'hidden',
				fontFamily: mono,
				fontSize,
				lineHeight: 1.45,
				...style,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 9,
					padding: '12px 18px',
					background: palette.bg2,
					borderBottom: `1px solid ${palette.border}`,
					color: palette.muted,
					fontFamily: sans,
					fontSize: 18,
				}}
			>
				<Dot c="#ff5f57" />
				<Dot c="#febc2e" />
				<Dot c="#28c840" />
				<span style={{ marginLeft: 10 }}>{title}</span>
			</div>
			<div style={{ padding: '18px 22px', whiteSpace: 'pre-wrap', color: palette.text }}>
				<div>
					<span style={{ color: palette.accent }}>❯ </span>
					<span>{command.slice(0, typed)}</span>
					{typed < command.length || frame < typingDone ? (
						<span style={{ opacity: cursorOn ? 1 : 0, color: palette.accent }}>▍</span>
					) : null}
				</div>
				{lines.slice(0, frame >= typingDone ? shownLines : 0).map((line, i) => (
					<div key={i} style={{ color: line.color ?? palette.muted, fontWeight: line.bold ? 700 : 400 }}>
						{line.text || ' '}
					</div>
				))}
			</div>
		</div>
	);
};

const Dot = ({ c }: { c: string }) => <span style={{ width: 13, height: 13, borderRadius: 7, background: c, display: 'inline-block' }} />;

export type CameraKey = { at: number; x: number; y: number; scale: number };

/**
 * A screenshot viewed through a camera. Each key says which point of the image (in image pixels)
 * is at the frame center and at what zoom; the camera eases between keys.
 */
export const Shot = ({
	src,
	width,
	height,
	keys,
	frameWidth = 1440,
	frameHeight = 1080,
	opacity = 1,
	marks = [],
}: {
	src: string;
	width: number;
	height: number;
	keys: CameraKey[];
	frameWidth?: number;
	frameHeight?: number;
	opacity?: number;
	marks?: Mark[];
}) => {
	const frame = useCurrentFrame();
	const at = keys.map((k) => k.at);
	const pick = (f: (k: CameraKey) => number) => (keys.length === 1 ? f(keys[0]) : tween(frame, at, keys.map(f)));
	const x = pick((k) => k.x);
	const y = pick((k) => k.y);
	const scale = pick((k) => k.scale);
	return (
		<AbsoluteFill style={{ overflow: 'hidden', opacity }}>
			<div
				style={{
					position: 'absolute',
					width,
					height,
					left: frameWidth / 2 - x * scale,
					top: frameHeight / 2 - y * scale,
					transform: `scale(${scale})`,
					transformOrigin: '0 0',
				}}
			>
				<Img src={staticFile(src)} style={{ width, height, borderRadius: 10, boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }} />
				{marks.map((m, i) => (
					<Ring key={i} {...m} />
				))}
			</div>
		</AbsoluteFill>
	);
};

export type Mark = { at: number; until?: number; x: number; y: number; w: number; h: number };

/** A pulsing accent ring drawn over a screenshot region (image pixels). */
const Ring = ({ at, until, x, y, w, h }: Mark) => {
	const frame = useCurrentFrame();
	const shown = tween(frame, [at, at + 10], [0, 1]) * (until === undefined ? 1 : tween(frame, [until - 10, until], [1, 0]));
	const pulse = 0.5 + 0.5 * Math.sin((frame - at) / 6);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				opacity: shown,
				border: `3px solid ${palette.accent}`,
				borderRadius: 8,
				boxShadow: `0 0 ${12 + 14 * pulse}px ${palette.accent}`,
			}}
		/>
	);
};

/** A springy pop-in scale for chips and nodes. */
export const usePop = (at: number) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	return spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 140 } });
};

// ---------------------------------------------------------------------------------------------
// Scene helpers. Screenshots are taken from a 1296x968 Persephone window.

export const SHOT_W = 1296;
export const SHOT_H = 968;
export const FULL: Omit<CameraKey, 'at'> = { x: SHOT_W / 2, y: SHOT_H / 2, scale: 1.0 };

export type SceneDef = { id: string; duration: number; render: (duration: number) => ReactNode };

export const totalDuration = (scenes: SceneDef[]) => scenes.reduce((sum, s) => sum + s.duration, 0);

/** Plays scenes back to back over the shared background. */
export const ScenePlayer = ({ scenes }: { scenes: SceneDef[] }) => {
	let from = 0;
	return (
		<AbsoluteFill>
			<Background />
			{scenes.map((scene) => {
				const start = from;
				from += scene.duration;
				return (
					<Sequence key={scene.id} from={start} durationInFrames={scene.duration} name={scene.id}>
						{scene.render(scene.duration)}
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const Scene = ({ duration, children }: { duration: number; children: ReactNode }) => {
	const frame = useCurrentFrame();
	return <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration) }}>{children}</AbsoluteFill>;
};

export const Code = ({ children, color = palette.accent }: { children: ReactNode; color?: string }) => (
	<span style={{ fontFamily: mono, color, fontWeight: 600 }}>{children}</span>
);

/** Cross-fades between screenshots: each entry is shown from its `at` frame. */
export const ShotSequence = ({ shots, keys }: { shots: { src: string; at: number; marks?: Mark[] }[]; keys: CameraKey[] }) => {
	const frame = useCurrentFrame();
	return (
		<>
			{shots.map((s, i) => {
				const next = shots[i + 1];
				const fadeIn = i === 0 ? 1 : tween(frame, [s.at, s.at + 10], [0, 1]);
				const fadeOut = next ? tween(frame, [next.at + 10, next.at + 11], [1, 0]) : 1;
				return <Shot key={s.src} src={s.src} width={SHOT_W} height={SHOT_H} keys={keys} marks={s.marks} opacity={fadeIn * fadeOut} />;
			})}
		</>
	);
};

export const Swap = ({ from, until, children }: { from: number; until?: number; children: ReactNode }) => (
	<Appear at={from} until={until} dy={30}>
		{children}
	</Appear>
);

export const BottomRight = ({ children }: { children: ReactNode }) => (
	<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-end', padding: '0 40px 40px 0' }}>{children}</AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------
// Conversation pieces: chat bubbles and the agent's step log.

/** A chat message. The user's text types in from `at`; the agent's lines fade in one by one. */
export const ChatBubble = ({
	at,
	who,
	text,
	width = 980,
	fontSize = 30,
	charsPerFrame = 1.4,
}: {
	at: number;
	who: 'user' | 'agent';
	text: string | string[];
	width?: number;
	fontSize?: number;
	charsPerFrame?: number;
}) => {
	const frame = useCurrentFrame() - at;
	const pop = usePop(at);
	const isUser = who === 'user';
	const lines = Array.isArray(text) ? text : [text];
	const full = lines.join('\n');
	const typed = isUser ? full.slice(0, Math.max(0, Math.floor(frame * charsPerFrame))) : full;
	const typing = isUser && typed.length < full.length;
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: isUser ? 'flex-end' : 'flex-start',
				opacity: Math.min(1, pop * 1.5),
				transform: `translateY(${(1 - pop) * 30}px)`,
			}}
		>
			<div style={{ fontFamily: sans, fontSize: 20, fontWeight: 700, color: isUser ? palette.accent2 : palette.orange, margin: '0 12px 8px' }}>
				{isUser ? 'You' : 'Claude'}
			</div>
			<div
				style={{
					maxWidth: width,
					fontFamily: sans,
					fontSize,
					lineHeight: 1.4,
					color: palette.text,
					whiteSpace: 'pre-wrap',
					background: isUser ? '#1c2a5c' : palette.panel,
					border: `1px solid ${isUser ? '#34488f' : palette.border}`,
					borderRadius: isUser ? '22px 22px 6px 22px' : '22px 22px 22px 6px',
					padding: '20px 28px',
					boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
				}}
			>
				{isUser
					? typed
					: lines.map((line, i) => (
							<div key={i} style={{ opacity: tween(frame, [i * 8, i * 8 + 10], [0, 1]) }}>
								{line}
							</div>
						))}
				{typing ? <span style={{ color: palette.accent2, opacity: Math.floor(frame / 8) % 2 ? 0 : 1 }}>▍</span> : null}
			</div>
		</div>
	);
};

/** Three bouncing dots: the agent is thinking. */
export const Thinking = ({ at, until }: { at: number; until: number }) => {
	const frame = useCurrentFrame();
	return (
		<Appear at={at} until={until} dy={10}>
			<div style={{ display: 'flex', gap: 10, padding: '18px 26px', background: palette.panel, border: `1px solid ${palette.border}`, borderRadius: 22, width: 'fit-content' }}>
				{[0, 1, 2].map((i) => (
					<span
						key={i}
						style={{
							width: 14,
							height: 14,
							borderRadius: 7,
							background: palette.orange,
							opacity: 0.4 + 0.6 * Math.max(0, Math.sin((frame - i * 5) / 5)),
						}}
					/>
				))}
			</div>
		</Appear>
	);
};

export type Step = { call: string; result: string; error?: boolean };

/**
 * The agent's tool calls as a growing list: a new step every `every` frames from `at`. Older steps
 * scroll up once more than `visible` are shown; the newest one carries a spinner until the next.
 */
export const StepLog = ({
	at,
	steps,
	every = 36,
	visible = 7,
	width = 1240,
	title = 'Claude → persephone.call',
}: {
	at: number;
	steps: Step[];
	every?: number;
	visible?: number;
	width?: number;
	title?: string;
}) => {
	const frame = useCurrentFrame() - at;
	const rowH = 96;
	const progress = Math.max(0, frame / every);
	const shown = Math.min(steps.length, Math.floor(progress) + 1);
	const scroll = Math.max(0, Math.min(steps.length - visible, progress + 1 - visible));
	const spin = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[Math.floor(frame / 3) % 10];
	return (
		<div
			style={{
				width,
				background: 'rgba(10,14,28,0.96)',
				border: `1px solid ${palette.border}`,
				borderRadius: 16,
				boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
				overflow: 'hidden',
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 18px', background: palette.bg2, borderBottom: `1px solid ${palette.border}`, color: palette.muted, fontFamily: sans, fontSize: 18 }}>
				<span style={{ width: 13, height: 13, borderRadius: 7, background: '#ff5f57' }} />
				<span style={{ width: 13, height: 13, borderRadius: 7, background: '#febc2e' }} />
				<span style={{ width: 13, height: 13, borderRadius: 7, background: '#28c840' }} />
				<span style={{ marginLeft: 10 }}>{title}</span>
				<span style={{ marginLeft: 'auto', fontFamily: mono }}>
					{shown}/{steps.length}
				</span>
			</div>
			<div style={{ height: rowH * visible, overflow: 'hidden', position: 'relative' }}>
				<div style={{ transform: `translateY(${-scroll * rowH}px)` }}>
					{steps.slice(0, shown).map((step, i) => {
						const local = frame - i * every;
						const done = i < shown - 1 || shown === steps.length;
						const mark = step.error ? '✗' : done ? '✓' : spin;
						const markColor = step.error ? palette.red : done ? palette.green : palette.orange;
						return (
							<div
								key={i}
								style={{
									height: rowH,
									boxSizing: 'border-box',
									padding: '14px 24px',
									display: 'flex',
									gap: 18,
									opacity: tween(local, [0, 8], [0, 1]),
									transform: `translateX(${tween(local, [0, 10], [-24, 0])}px)`,
									borderBottom: `1px solid rgba(42,53,87,0.5)`,
								}}
							>
								<div style={{ fontFamily: mono, fontSize: 26, color: markColor, width: 26 }}>{mark}</div>
								<div style={{ minWidth: 0 }}>
									<div style={{ fontFamily: mono, fontSize: 23, color: palette.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
										{step.call}
									</div>
									<div
										style={{
											fontFamily: sans,
											fontSize: 21,
											color: step.error ? palette.red : palette.muted,
											marginTop: 4,
											opacity: tween(local, [10, 18], [0, 1]),
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										}}
									>
										→ {step.result}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
