import { describe, expect, it } from 'vitest';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { compressResponse, pickEncoding } from '$lib/server/compression';

const html = '<!doctype html><p>' + 'Living Dex '.repeat(500) + '</p>';

function request(acceptEncoding?: string, method = 'GET') {
	return new Request('http://localhost/', {
		method,
		headers: acceptEncoding ? { 'accept-encoding': acceptEncoding } : {}
	});
}

function page(body: BodyInit | null = html, init: ResponseInit = {}) {
	return new Response(body, {
		status: 200,
		headers: { 'content-type': 'text/html; charset=utf-8', 'content-length': '999' },
		...init
	});
}

async function bytes(response: Response) {
	return Buffer.from(await response.arrayBuffer());
}

describe('pickEncoding', () => {
	it.each([
		['gzip, deflate, br', 'br'],
		['gzip', 'gzip'],
		['br;q=0, gzip', 'gzip'],
		['*', 'br'],
		['identity', null],
		['gzip;q=0', null]
	])('%s -> %s', (header, expected) => {
		expect(pickEncoding(header)).toBe(expected);
	});

	it('returns null when the client sends no Accept-Encoding', () => {
		expect(pickEncoding(null)).toBeNull();
	});
});

describe('compressResponse', () => {
	it('brotli-compresses HTML and the body round-trips', async () => {
		const response = compressResponse(request('gzip, br'), page());

		expect(response.headers.get('content-encoding')).toBe('br');
		expect(response.headers.get('content-length')).toBeNull();
		expect(response.headers.get('vary')).toMatch(/Accept-Encoding/);
		const body = await bytes(response);
		expect(body.length).toBeLessThan(html.length / 4);
		expect(brotliDecompressSync(body).toString()).toBe(html);
	});

	it('falls back to gzip for JSON', async () => {
		const json = JSON.stringify({ rows: Array.from({ length: 200 }, (_, i) => ({ i })) });
		const response = compressResponse(
			request('gzip'),
			new Response(json, { headers: { 'content-type': 'application/json' } })
		);

		expect(response.headers.get('content-encoding')).toBe('gzip');
		expect(gunzipSync(await bytes(response)).toString()).toBe(json);
	});

	it('keeps set-cookie headers and the status', async () => {
		const original = page(html, { status: 404 });
		original.headers.append('set-cookie', 'a=1; Path=/');
		original.headers.append('set-cookie', 'b=2; Path=/');
		const response = compressResponse(request('br'), original);

		expect(response.status).toBe(404);
		expect(response.headers.getSetCookie()).toEqual(['a=1; Path=/', 'b=2; Path=/']);
	});

	it('flushes each streamed chunk rather than buffering the whole body', async () => {
		let sendRest: () => void = () => {};
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(new TextEncoder().encode('<p>shell</p>'));
				sendRest = () => {
					controller.enqueue(new TextEncoder().encode('<p>streamed data</p>'));
					controller.close();
				};
			}
		});
		const response = compressResponse(request('gzip'), page(stream));
		const reader = response.body!.getReader();

		// The shell arrives while the stream is still open.
		const first = await reader.read();
		expect(gunzipSync(Buffer.from(first.value!), { finishFlush: 2 }).toString()).toBe(
			'<p>shell</p>'
		);

		sendRest();
		const rest: Uint8Array[] = [Buffer.from(first.value!)];
		for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
			rest.push(chunk.value);
		}
		expect(gunzipSync(Buffer.concat(rest)).toString()).toBe('<p>shell</p><p>streamed data</p>');
	});

	it('passes responses through inside a Netlify (Lambda) function', () => {
		// adapter-netlify reads text bodies with response.text(), which would corrupt compressed bytes.
		process.env.AWS_LAMBDA_FUNCTION_NAME = 'sveltekit-render';
		try {
			const original = page();
			expect(compressResponse(request('br'), original)).toBe(original);
		} finally {
			delete process.env.AWS_LAMBDA_FUNCTION_NAME;
		}
	});

	it.each([
		['a client that accepts no encoding', request(), page()],
		['a HEAD request', request('br', 'HEAD'), page(null)],
		['an image', request('br'), new Response('png', { headers: { 'content-type': 'image/png' } })],
		['a 304', request('br'), new Response(null, { status: 304 })],
		[
			'an already-encoded body',
			request('br'),
			new Response('x', { headers: { 'content-type': 'text/html', 'content-encoding': 'gzip' } })
		]
	])('leaves %s uncompressed', async (_label, req, res) => {
		const response = compressResponse(req, res);
		expect(response.headers.get('content-encoding')).toBe(res.headers.get('content-encoding'));
	});
});
