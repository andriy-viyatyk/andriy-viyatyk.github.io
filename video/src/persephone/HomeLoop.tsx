// The home-page clip: a seamless loop of Persephone screens, each with a feature card that pops in,
// and zooms on the Explorer, the workspace Boards panel and the editor switch. It plays muted and
// loops like a GIF, so the last frame is the first one again. See the home recipe in video/README.md.
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, CameraKey, Mark, palette, sans, Shot, SHOT_H, SHOT_W, tween } from '../kit';

const FADE = 14;
const FULL_AT = (at: number): CameraKey => ({ at, x: SHOT_W / 2, y: SHOT_H / 2, scale: 1.0 });

type Card = { at: number; until: number; name: string; note: string };
type Slide = { src: string; at: number; keys: CameraKey[]; marks?: Mark[]; cards?: Card[] };

// Every frame number below is global (the whole clip), not per slide.
const slides: Slide[] = [
	{ src: 'p-notepad.png', at: 0, keys: [FULL_AT(0), { at: 150, x: 648, y: 420, scale: 1.08 }] },
	{
		src: 'p-ws-website.png',
		at: 135,
		keys: [
			{ at: 135, x: 600, y: 420, scale: 1.0 },
			{ at: 165, x: 330, y: 245, scale: 2.2 },
			{ at: 235, x: 330, y: 245, scale: 2.2 },
			{ at: 265, x: 765, y: 380, scale: 1.4 },
		],
		marks: [{ at: 170, until: 235, x: 4, y: 78, w: 344, h: 132 }],
		cards: [
			{ at: 165, until: 235, name: 'Folders open as workspaces', note: 'Each tab gets its own Explorer' },
			{ at: 255, until: 335, name: 'Markdown with diagrams', note: 'Mermaid charts render in the preview' },
		],
	},
	{
		src: 'p-json-grid.png',
		at: 340,
		keys: [{ at: 340, x: 640, y: 350, scale: 1.55 }, { at: 490, x: 610, y: 330, scale: 1.75 }],
		marks: [{ at: 380, until: 480, x: 1102, y: 47, w: 190, h: 24 }],
		cards: [{ at: 355, until: 485, name: 'JSON and CSV as a grid', note: 'Sort, filter, edit, paste from Excel' }],
	},
	{
		src: 'p-excalidraw.png',
		at: 490,
		keys: [{ at: 490, x: 790, y: 470, scale: 1.25 }, { at: 630, x: 790, y: 460, scale: 1.4 }],
		cards: [{ at: 505, until: 625, name: 'Sketch with Excalidraw', note: 'Built in, saved as a plain file' }],
	},
	{
		src: 'h-palette.png',
		at: 630,
		keys: [
			{ at: 630, x: 640, y: 420, scale: 1.0 },
			{ at: 660, x: 300, y: 230, scale: 2.4 },
			{ at: 735, x: 300, y: 230, scale: 2.4 },
			{ at: 770, x: 810, y: 440, scale: 1.12 },
		],
		marks: [{ at: 665, until: 735, x: 4, y: 150, w: 344, h: 66 }],
		cards: [
			{ at: 660, until: 735, name: 'Boards live in your workspace', note: 'Small apps, each one just a folder' },
			{ at: 755, until: 845, name: 'A board is a mini app', note: 'Ask your AI agent to build one' },
		],
	},
	{
		src: 'p-budget-viewer.png',
		at: 850,
		keys: [{ at: 850, x: 820, y: 420, scale: 1.15 }, { at: 900, x: 1000, y: 300, scale: 1.9 }, { at: 950, x: 1000, y: 300, scale: 1.9 }, { at: 985, x: 820, y: 420, scale: 1.15 }],
		marks: [{ at: 900, until: 955, x: 1056, y: 47, w: 236, h: 25 }],
		cards: [{ at: 870, until: 1005, name: 'Viewers for your own files', note: 'Your .budget.csv opens in a board' }],
	},
	{
		src: 'h-browser.png',
		at: 1010,
		keys: [{ at: 1010, x: 648, y: 440, scale: 1.08 }, { at: 1095, x: 648, y: 440, scale: 1.08 }, { at: 1125, x: 660, y: 560, scale: 1.25 }, { at: 1190, x: 660, y: 580, scale: 1.3 }],
		marks: [{ at: 1030, until: 1095, x: 110, y: 46, w: 1010, h: 26 }],
		cards: [
			{ at: 1025, until: 1095, name: 'A built-in browser', note: 'Your AI agent can read and drive it too' },
			{ at: 1105, until: 1190, name: 'Install viewers on demand', note: 'Word, Excel, PowerPoint, PDF, SQLite…' },
		],
	},
	{ src: 'p-notepad.png', at: 1195, keys: [{ at: 1195, x: 648, y: 420, scale: 1.08 }, FULL_AT(1330)] },
];

export const HOME_LOOP_DURATION = 1340;

export const HomeLoop = () => (
	<AbsoluteFill>
		<Background />
		{slides.map((s, i) => {
			const next = slides[i + 1];
			return <SlideView key={i} slide={s} nextAt={next?.at} first={i === 0} />;
		})}
		{slides.flatMap((s) => s.cards ?? []).map((c, i) => (
			<FeatureCard key={i} {...c} />
		))}
		<TitleCard at={20} until={125} title="Persephone" line="A notepad for Windows that opens almost anything" />
		<TitleCard at={1205} until={1310} title="Persephone" line="Free and open source · works with your AI agent" />
	</AbsoluteFill>
);

const SlideView = ({ slide, nextAt, first }: { slide: Slide; nextAt?: number; first: boolean }) => {
	const frame = useCurrentFrame();
	const fadeIn = first ? 1 : tween(frame, [slide.at, slide.at + FADE], [0, 1]);
	// Stay fully opaque under the next slide's fade-in, then drop out.
	const fadeOut = nextAt === undefined ? 1 : tween(frame, [nextAt + FADE, nextAt + FADE + 1], [1, 0]);
	if (fadeIn * fadeOut === 0) return null;
	return <Shot src={slide.src} width={SHOT_W} height={SHOT_H} keys={slide.keys} marks={slide.marks} opacity={fadeIn * fadeOut} />;
};

/** Springs in from below, fades out at `until`. */
const usePopIn = (at: number, until: number) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const pop = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 150 } });
	const out = tween(frame, [until - 10, until], [1, 0]);
	return { pop, opacity: Math.min(1, pop * 1.5) * out, visible: frame >= at && frame < until };
};

const FeatureCard = ({ at, until, name, note }: Card) => {
	const { pop, opacity, visible } = usePopIn(at, until);
	if (!visible) return null;
	return (
		<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 0 64px 64px' }}>
			<div
				style={{
					opacity,
					transform: `translateY(${(1 - pop) * 60}px) scale(${0.85 + 0.15 * pop})`,
					transformOrigin: 'left bottom',
					fontFamily: sans,
					background: 'rgba(11,16,32,0.94)',
					border: `1px solid ${palette.border}`,
					borderLeft: `8px solid ${palette.accent}`,
					borderRadius: 18,
					padding: '22px 34px',
					boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
				}}
			>
				<div style={{ fontSize: 54, fontWeight: 800, color: palette.text, whiteSpace: 'nowrap' }}>{name}</div>
				<div style={{ fontSize: 32, color: palette.muted, marginTop: 6, whiteSpace: 'nowrap' }}>{note}</div>
			</div>
		</AbsoluteFill>
	);
};

const TitleCard = ({ at, until, title, line }: { at: number; until: number; title: string; line: string }) => {
	const { pop, opacity, visible } = usePopIn(at, until);
	if (!visible) return null;
	return (
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
			<div
				style={{
					opacity,
					transform: `scale(${0.8 + 0.2 * pop})`,
					fontFamily: sans,
					textAlign: 'center',
					background: 'rgba(11,16,32,0.94)',
					border: `1px solid ${palette.border}`,
					borderTop: `8px solid ${palette.accent}`,
					borderRadius: 24,
					padding: '44px 64px',
					boxShadow: '0 30px 90px rgba(0,0,0,0.6)',
				}}
			>
				<div style={{ fontSize: 110, fontWeight: 800, color: palette.text, letterSpacing: -2 }}>{title}</div>
				<div style={{ fontSize: 38, color: palette.muted, marginTop: 10, whiteSpace: 'nowrap' }}>{line}</div>
			</div>
		</AbsoluteFill>
	);
};
