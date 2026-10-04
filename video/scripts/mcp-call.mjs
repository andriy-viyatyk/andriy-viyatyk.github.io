// A minimal client for Persephone's MCP server (one `call` tool over streamable HTTP), for driving
// recordings from a shell when the agent's own MCP connection is down (for example right after
// Persephone restarts).
//
//   node video/scripts/mcp-call.mjs '{"path":"pages"}'           # prints the result text
//   node video/scripts/mcp-call.mjs '{"path":"window.screen.screenshot","args":[]}' shot.png
//
// As a module: import { callPersephone } from './mcp-call.mjs'.
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const url = 'http://127.0.0.1:7865/mcp';
const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' };

async function rpc(body, session) {
	const response = await fetch(url, {
		method: 'POST',
		headers: session ? { ...headers, 'mcp-session-id': session } : headers,
		body: JSON.stringify(body),
	});
	const text = await response.text();
	const sse = text.match(/^data: (.*)$/m);
	return { session: response.headers.get('mcp-session-id'), json: text ? JSON.parse(sse ? sse[1] : text) : null };
}

/** Calls the `call` tool once; returns the text parts joined. An image part is saved to imagePath. */
export async function callPersephone(args, imagePath = 'shot.png') {
	const init = await rpc({
		jsonrpc: '2.0', id: 1, method: 'initialize',
		params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'site-video', version: '1' } },
	});
	const session = init.session;
	await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, session);
	try {
		const result = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'call', arguments: args } }, session);
		const out = result.json.result ?? result.json.error;
		const parts = [];
		for (const part of out.content ?? [out]) {
			if (part.type === 'image') {
				writeFileSync(imagePath, Buffer.from(part.data, 'base64'));
				parts.push(`[image saved] ${imagePath}`);
			} else parts.push(part.text ?? JSON.stringify(part));
		}
		return parts.join('\n');
	} finally {
		// Close the session, so the header's MCP connection count does not keep growing.
		await fetch(url, { method: 'DELETE', headers: { 'mcp-session-id': session } }).catch(() => {});
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	console.log(await callPersephone(JSON.parse(process.argv[2]), process.argv[3]));
	process.exit(0);
}
