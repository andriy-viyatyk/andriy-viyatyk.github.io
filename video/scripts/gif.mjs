// Makes the looping GIF the site shows for a video (DemoClip renders a .gif as an image: it plays
// at once and needs no player). Two passes through the ffmpeg that ships with Remotion: build a
// 128-colour palette from the whole clip, then encode with it.
//
// 720 px at 10 fps matches the site's content column and keeps a 45 s clip near 7–14 MB. Short
// screen recordings with little motion can afford 960 px at 12 fps. Zooms and scrolling grids make
// GIFs large (av-grid, 90 s, is ~31 MB at the defaults).
//
//   node scripts/gif.mjs <name> [width] [fps]   → out/<name>.gif
import { execSync } from 'node:child_process';
import { rmSync, statSync } from 'node:fs';

const [name, width = '720', fps = '10'] = process.argv.slice(2);
if (!name) {
	console.error('usage: node scripts/gif.mjs <name> [width] [fps]');
	process.exit(1);
}
// Remotion's ffmpeg build has no fps filter, so the frame rate is set with -r on the output.
const filters = `scale=${width}:-1:flags=lanczos`;
const ffmpeg = (...args) =>
	execSync(['npx remotion ffmpeg -hide_banner -loglevel error -y', ...args.map((a) => `"${a}"`)].join(' '), { stdio: 'inherit' });

const palette = `out/${name}.palette.png`;
ffmpeg('-i', `out/${name}.mp4`, '-vf', `${filters},palettegen=max_colors=128:stats_mode=diff`, palette);
ffmpeg('-i', `out/${name}.mp4`, '-i', palette, '-lavfi', `${filters}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`, '-r', fps, '-loop', '0', `out/${name}.gif`);
rmSync(palette);
console.log(`ready: out/${name}.gif (${(statSync(`out/${name}.gif`).size / 1e6).toFixed(1)} MB)`);
