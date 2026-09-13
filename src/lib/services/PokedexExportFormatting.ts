import type { CombinedData } from '$lib/models/CombinedData';
import type { Pokedex } from '$lib/models/Pokedex';

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

export function buildCsv(pokedex: Pokedex, combinedData: CombinedData[]): string {
	void pokedex;
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
			hasGigantamaxed: false,
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

export function shouldRefreshToken(expiresAt: string | null): boolean {
	if (!expiresAt) return false;
	const expiry = new Date(expiresAt).getTime();
	if (!Number.isFinite(expiry)) return false;
	return expiry - Date.now() < 60_000;
}
