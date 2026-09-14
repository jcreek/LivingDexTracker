const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

export function isLoopbackUrl(value: string): boolean {
	try {
		return LOOPBACK_HOSTS.has(new URL(value).hostname);
	} catch {
		return false;
	}
}

export function requireLoopbackUrl(value: string, label: string): string {
	if (!isLoopbackUrl(value))
		throw new Error(`Refusing to send credentials to non-loopback ${label}`);
	return value;
}
