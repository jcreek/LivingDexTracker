export type ExportProvider = 'google_drive' | 'dropbox';

export interface PokedexExportIntegration {
	_id: string;
	userId: string;
	pokedexId: string | null;
	provider: ExportProvider;
	enabled: boolean;
	fileName: string | null;
	folderId: string | null;
	path: string | null;
	accessToken: string;
	refreshToken: string | null;
	accessTokenExpiresAt: string | null;
	metadata: Record<string, unknown> | null;
	lastExportedAt: string | null;
	lastError: string | null;
	/** Set by a database trigger on every write, so it doubles as the row's version. */
	updatedAt: string | null;
}

export interface PokedexExportIntegrationDB {
	id: string;
	userId: string;
	pokedexId: string | null;
	provider: ExportProvider;
	enabled: boolean;
	fileName: string | null;
	folderId: string | null;
	path: string | null;
	accessToken: string;
	refreshToken: string | null;
	accessTokenExpiresAt: string | null;
	metadata: Record<string, unknown> | null;
	lastExportedAt: string | null;
	lastError: string | null;
	updatedAt: string | null;
}
