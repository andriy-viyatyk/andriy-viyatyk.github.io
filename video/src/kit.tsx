// Building blocks shared by the site videos: palette, fades, captions, a typing terminal and a
// screenshot "camera" that pans and zooms between keyframes.
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

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

export type Mark = { at: number; x: number; y: number; w: number; h: number };

/** A pulsing accent ring drawn over a screenshot region (image pixels). */
const Ring = ({ at, x, y, w, h }: Mark) => {
	const frame = useCurrentFrame();
	const shown = tween(frame, [at, at + 10], [0, 1]);
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
