import { Composition } from 'remotion';
import { AiVision, AI_VISION_DURATION } from './ai-vision/AiVision';
import { BoardsTodo, BOARDS_TODO_DURATION } from './boards/BoardsTodo';
import { Platform, PLATFORM_DURATION } from './persephone/Platform';

export const Root = () => (
	<>
		<Composition id="AiVision" component={AiVision} durationInFrames={AI_VISION_DURATION} fps={30} width={1440} height={1080} />
		<Composition id="BoardsTodo" component={BoardsTodo} durationInFrames={BOARDS_TODO_DURATION} fps={30} width={1440} height={1080} />
		<Composition id="Platform" component={Platform} durationInFrames={PLATFORM_DURATION} fps={30} width={1440} height={1080} />
	</>
);
