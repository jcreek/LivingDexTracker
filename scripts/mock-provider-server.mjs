#!/usr/bin/env node

import { createServer } from 'node:http';

const port = Number(process.env.MOCK_PROVIDER_PORT ?? 4199);
const state = { requests: [], failUploads: false, refreshes: 0 };

function send(response, status, body, headers = {}) {
	response.writeHead(status, { 'Content-Type': 'application/json', ...headers });
	response.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const server = createServer(async (request, response) => {
	const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`);
	let body = '';
	for await (const chunk of request) body += chunk;

	// Control-plane calls (including Playwright's webServer readiness polling of /__mock/state)
	// must not show up as provider traffic the assertions then reason about.
	if (!url.pathname.startsWith('/__mock/')) {
		state.requests.push({ method: request.method, path: url.pathname, query: url.search, body });
	}

	if (url.pathname === '/__mock/state') return send(response, 200, state);
	if (url.pathname === '/__mock/reset') {
		state.requests = [];
		state.failUploads = false;
		state.refreshes = 0;
		return send(response, 200, { ok: true });
	}
	if (url.pathname === '/__mock/fail-uploads') {
		state.failUploads = true;
		return send(response, 200, { ok: true });
	}

	if (url.pathname.endsWith('/authorize')) {
		const redirectUri = url.searchParams.get('redirect_uri');
		const oauthState = url.searchParams.get('state');
		if (!redirectUri || !oauthState) return send(response, 400, { error: 'missing redirect data' });
		const callback = new URL(redirectUri);
		callback.searchParams.set('code', 'mock-authorization-code');
		callback.searchParams.set('state', oauthState);
		response.writeHead(302, { Location: callback.toString() });
		return response.end();
	}

	if (url.pathname.endsWith('/token')) {
		if (body.includes('grant_type=refresh_token')) state.refreshes++;
		return send(response, 200, {
			access_token: 'mock-access-token',
			refresh_token: 'mock-refresh-token',
			expires_in: 3600,
			scope: 'files.content.write drive.file'
		});
	}

	if (url.pathname.includes('/upload') || url.pathname.endsWith('/files/upload')) {
		if (state.failUploads) return send(response, 503, { error: 'mock upload failure' });
		return send(response, 200, { id: 'mock-file-id', name: 'pokedex.csv' });
	}

	if (url.pathname.endsWith('/drive/files')) {
		if (request.method === 'GET') return send(response, 200, { files: [{ id: 'mock-folder-id' }] });
		return send(response, 200, { id: 'mock-folder-id' });
	}

	return send(response, 404, { error: `No mock route for ${url.pathname}` });
});

server.listen(port, '127.0.0.1', () => {
	console.log(`Mock provider server listening on http://127.0.0.1:${port}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
	process.on(signal, () => server.close(() => process.exit(0)));
}
