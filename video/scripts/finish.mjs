// Makes a rendered video ready for the site: moves the MP4 index to the front (faststart, so the
// browser can start playing before the whole file arrives) and extracts a JPEG poster frame.
// Uses the ffmpeg that ships with Remotion, so nothing else needs installing.
//
//   node scripts/finish.mjs <name> [posterSeconds]
//   e.g. node scripts/finish.mjs boards-todo-demo 4.5   → out/boards-todo-demo.mp4 + .jpg
import { execSync } from 'node:child_process';
import { renameSync } from 'node:fs';

const [name, posterAt = '4'] = process.argv.slice(2);
if (!name) {
	console.error('usage: node scripts/finish.mjs <name> [posterSeconds]');
	process.exit(1);
}
const mp4 = `out/${name}.mp4`;
const ffmpeg = (...args) =>
	execSync(['npx remotion ffmpeg -hide_banner -loglevel error -y', ...args.map((a) => `"${a}"`)].join(' '), { stdio: 'inherit' });

ffmpeg('-i', mp4, '-c', 'copy', '-movflags', '+faststart', `out/${name}.tmp.mp4`);
renameSync(`out/${name}.tmp.mp4`, mp4);
ffmpeg('-ss', posterAt, '-i', mp4, '-frames:v', '1', '-q:v', '3', `out/${name}.jpg`);
console.log(`ready: ${mp4} and out/${name}.jpg`);
