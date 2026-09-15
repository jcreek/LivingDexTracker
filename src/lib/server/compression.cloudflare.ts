/** Cloudflare performs transport compression; preserve the streaming Response body. */
export function compressResponse(_request: Request, response: Response): Response {
	return response;
}
