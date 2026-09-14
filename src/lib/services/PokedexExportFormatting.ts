import type { CombinedData } from '$lib/models/CombinedData';

export function csvEscape(value: unknown): string {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
	return str;
}

export function sanitizeFileName(name: string, fallback: string): string {
	const trimmed = name.trim();
	const safe = trimmed.replace(/[\\/:*?"<>|]+/g, '-');
	if (!safe) return fallback;
	return safe.endsWith('.csv') ? safe : `${safe}.csv`;
}

export function buildCsv(combinedData: CombinedData[]): string {
	const headers = [
		'pokemonId',
		'pokedexNumber',
		'pokemon',
		'form',
		'caught',
		'haveToEvolve',
		'inHome',
		'personalNotes'
	];
	const lines = [headers.map(csvEscape).join(',')];

	for (const row of combinedData) {
		const entry = row.pokedexEntry;
		const catchRecord = row.catchRecord ?? {
			caught: false,
			haveToEvolve: false,
			inHome: false,
			personalNotes: ''
		};
		lines.push(
			[
				entry._id,
				entry.pokedexNumber,
				entry.pokemon,
				entry.form || '',
				catchRecord.caught,
				catchRecord.haveToEvolve,
				catchRecord.inHome,
				catchRecord.personalNotes || ''
			]
				.map(csvEscape)
				.join(',')
		);
	}

	return lines.join('\r\n');
}

/** OAuth providers answer a revoked or expired refresh token with `invalid_grant`. */
export function isRevokedGrant(status: number, body: string): boolean {
	if (status !== 400 && status !== 401) return false;
	try {
		const parsed = JSON.parse(body) as { error?: unknown } | null;
		return parsed?.error === 'invalid_grant';
	} catch {
		return false;
	}
}

export function shouldRefreshToken(expiresAt: string | null): boolean {
	if (!expiresAt) return false;
	const expiry = new Date(expiresAt).getTime();
	if (!Number.isFinite(expiry)) return false;
	return expiry - Date.now() < 60_000;
}
