import { Composition } from 'remotion';
import { AiVision, AI_VISION_DURATION } from './ai-vision/AiVision';

export const Root = () => (
	<Composition
		id="AiVision"
		component={AiVision}
		durationInFrames={AI_VISION_DURATION}
		fps={30}
		width={1440}
		height={1080}
	/>
);
