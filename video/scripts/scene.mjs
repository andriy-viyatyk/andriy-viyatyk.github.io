// Runs one or more scene files in Persephone's renderer through the MCP server's script.execute.
//
//   node video/scripts/scene.mjs <file.js> [<file.js> ...] [--wait <flag>] [--take]
//
// Files run in order, each as ONE script.execute call (so window globals such as __demo and __ws
// carry over between them). --take sets window.__TAKE = true first, which the scene files read to
// start and stop the recording; without it the same files make a dry run. --wait <flag> polls until
// window[<flag>] === true after the files ran: script.execute returns "Pending" as soon as a dialog
// opens, even when the script answers that dialog itself and keeps running.
//
// Persephone must run with "mcp.enabled": true on 127.0.0.1:7865 (see scripts/demo-data.ps1).
import { readFileSync } from 'node:fs';
import { callPersephone } from './mcp-call.mjs';

const args = process.argv.slice(2);
const files = [];
let waitFlag;
let take = false;
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--wait') waitFlag = args[++i];
	else if (args[i] === '--take') take = true;
	else files.push(args[i]);
}

const execute = (code) => callPersephone({ path: 'script.execute', args: [code] });
if (take) await execute('window.__TAKE = true; return true;');
for (const file of files) {
	const text = await execute(readFileSync(file, 'utf8'));
	console.log(`── ${file}\n${text}`);
}
if (waitFlag) {
	for (;;) {
		const text = await execute(`return window[${JSON.stringify(waitFlag)}] === true;`);
		if (/"text":\s*"true"|^true$/m.test(text)) break;
		await new Promise((r) => setTimeout(r, 1000));
	}
	console.log(`── ${waitFlag} is set`);
}
process.exit(0);
