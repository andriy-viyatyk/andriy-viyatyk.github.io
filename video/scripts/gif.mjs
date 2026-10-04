// Makes a looping GIF from a rendered video, for places where a video will not play (a GitHub
// README, for example). Two passes through the ffmpeg that ships with Remotion: build a palette
// from the whole clip, then encode with it. 560 px wide at 12 fps keeps a 45 s clip near 13 MB; zooms make GIFs large.
//
//   node scripts/gif.mjs <name> [width] [fps]   → out/<name>.gif
import { execSync } from 'node:child_process';

const [name, width = '560', fps = '12'] = process.argv.slice(2);
if (!name) {
	console.error('usage: node scripts/gif.mjs <name> [width] [fps]');
	process.exit(1);
}
// Remotion's ffmpeg build has no fps filter, so the frame rate is set with -r on the output.
const filters = `scale=${width}:-1:flags=lanczos`;
const ffmpeg = (...args) =>
	execSync(['npx remotion ffmpeg -hide_banner -loglevel error -y', ...args.map((a) => `"${a}"`)].join(' '), { stdio: 'inherit' });

ffmpeg('-i', `out/${name}.mp4`, '-vf', `${filters},palettegen=stats_mode=diff`, `out/${name}.palette.png`);
ffmpeg('-i', `out/${name}.mp4`, '-i', `out/${name}.palette.png`, '-lavfi', `${filters}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`, '-r', fps, '-loop', '0', `out/${name}.gif`);
console.log(`ready: out/${name}.gif`);
