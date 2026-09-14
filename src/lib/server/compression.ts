import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { constants, createBrotliCompress, createGzip } from 'node:zlib';

export type Encoding = 'br' | 'gzip';

// Text responses the app renders or returns from API routes. Images, fonts and other binary
// content is already compressed, so re-compressing it only costs CPU.
const COMPRESSIBLE = /^(text\/|application\/(json|javascript|xml|manifest\+json)|image\/svg\+xml)/i;

/** Picks the best encoding the client accepts, preferring brotli. Honours `q=0` refusals. */
export function pickEncoding(acceptEncoding: string | null): Encoding | null {
	if (!acceptEncoding) return null;
	const accepted = new Map<string, number>();
	for (const part of acceptEncoding.split(',')) {
		const [name, ...params] = part.trim().toLowerCase().split(';');
		const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
		accepted.set(name, q ? Number(q.slice(2)) : 1);
	}
	const allows = (name: Encoding) => (accepted.get(name) ?? accepted.get('*') ?? 0) > 0;
	if (allows('br')) return 'br';
	if (allows('gzip')) return 'gzip';
	return null;
}

// adapter-netlify's Lambda handler serialises text responses with `response.text()`, which would
// corrupt a compressed body. Netlify compresses function responses itself, so skip it there.
// Everywhere else (the Node build, local preview, CI) the app compresses its own responses.
const serialisesBodiesAsText = () => Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

function shouldCompress(request: Request, response: Response): boolean {
	if (serialisesBodiesAsText()) return false;
	if (!response.body || request.method === 'HEAD') return false;
	if (response.status < 200 || response.status === 204 || response.status === 304) return false;
	if (response.headers.has('content-encoding')) return false;
	return COMPRESSIBLE.test(response.headers.get('content-type') ?? '');
}

/**
 * Compresses a rendered page or API response so its transfer size doesn't depend on the host.
 * Every chunk is flushed as soon as it is written, so SvelteKit's streamed load data still reaches
 * the browser progressively instead of waiting for the whole body.
 */
export function compressResponse(request: Request, response: Response): Response {
	if (!shouldCompress(request, response)) return response;
	const encoding = pickEncoding(request.headers.get('accept-encoding'));

	const headers = new Headers(response.headers);
	// Caches must key on the request encoding even when this response isn't compressed.
	headers.append('vary', 'Accept-Encoding');
	if (!encoding) return new Response(response.body, { status: response.status, headers });

	const compressor =
		encoding === 'br'
			? createBrotliCompress({
					flush: constants.BROTLI_OPERATION_FLUSH,
					// Quality 11 is for build-time precompression; 5 is fast enough per request.
					params: { [constants.BROTLI_PARAM_QUALITY]: 5 }
				})
			: createGzip({ flush: constants.Z_SYNC_FLUSH, level: 6 });

	const source = Readable.fromWeb(response.body as unknown as NodeReadableStream);
	source.on('error', (error) => compressor.destroy(error));
	source.pipe(compressor);

	headers.set('content-encoding', encoding);
	headers.delete('content-length');
	return new Response(Readable.toWeb(compressor) as unknown as ReadableStream, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
