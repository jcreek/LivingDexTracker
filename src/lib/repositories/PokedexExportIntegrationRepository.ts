import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	PokedexExportIntegration,
	PokedexExportIntegrationDB
} from '$lib/models/PokedexExportIntegration';

// `from()` returns a table builder; only `select()` yields the filter builder that `eq`/`is`
// live on. Typing the scope helper with the table builder made `data` untyped downstream.
type IntegrationQuery = ReturnType<ReturnType<SupabaseClient['from']>['select']>;

class PokedexExportIntegrationRepository {
	constructor(
		private supabase: SupabaseClient,
		private userId: string,
		private pokedexId: string | null
	) {}

	private transform(db: PokedexExportIntegrationDB): PokedexExportIntegration {
		return {
			_id: db.id,
			userId: db.userId,
			pokedexId: db.pokedexId,
			provider: db.provider,
			enabled: db.enabled,
			fileName: db.fileName,
			folderId: db.folderId,
			path: db.path,
			accessToken: db.accessToken,
			refreshToken: db.refreshToken,
			accessTokenExpiresAt: db.accessTokenExpiresAt,
			metadata: db.metadata,
			lastExportedAt: db.lastExportedAt,
			lastError: db.lastError,
			updatedAt: db.updatedAt ?? null
		};
	}

	private baseQuery() {
		return this.supabase.from('pokedex_export_integrations').select('*').eq('userId', this.userId);
	}

	private addPokedexScope(query: IntegrationQuery): IntegrationQuery {
		if (this.pokedexId) {
			return query.eq('pokedexId', this.pokedexId);
		}
		return query.is('pokedexId', null);
	}

	async listEnabled(): Promise<PokedexExportIntegration[]> {
		const { data, error } = await this.addPokedexScope(this.baseQuery()).eq('enabled', true);

		if (error) {
			console.error('Failed to load export integrations:', error);
			throw new Error(`Failed to load export integrations: ${error.message}`);
		}
		if (!data) return [];
		// PostgREST rows are untyped without generated database types.
		return (data as PokedexExportIntegrationDB[]).map((row) => this.transform(row));
	}

	async listAll(): Promise<PokedexExportIntegration[]> {
		const { data, error } = await this.addPokedexScope(this.baseQuery());

		if (error) {
			console.error('Failed to load export integrations:', error);
			throw new Error(`Failed to load export integrations: ${error.message}`);
		}
		if (!data) return [];
		// PostgREST rows are untyped without generated database types.
		return (data as PokedexExportIntegrationDB[]).map((row) => this.transform(row));
	}

	async upsert(
		data: Partial<PokedexExportIntegrationDB> & Pick<PokedexExportIntegrationDB, 'provider'>
	): Promise<PokedexExportIntegration> {
		const payload: Partial<PokedexExportIntegrationDB> = {
			userId: this.userId,
			pokedexId: null,
			...data
		};
		const { data: result, error } = await this.supabase
			.from('pokedex_export_integrations')
			.upsert(payload, {
				onConflict: 'userId,provider'
			})
			.select()
			.single();

		if (error) {
			console.error('Failed to upsert export integration:', error);
			throw new Error(`Failed to save export integration: ${error.message}`);
		}
		if (!result) {
			throw new Error('Failed to save export integration: No result returned');
		}
		return this.transform(result);
	}

	async listEnabledForPokedexOrUser(): Promise<PokedexExportIntegration[]> {
		const base = this.supabase
			.from('pokedex_export_integrations')
			.select('*')
			.eq('userId', this.userId)
			.eq('enabled', true);
		const query = this.pokedexId
			? base.or(`pokedexId.eq.${this.pokedexId},pokedexId.is.null`)
			: base.is('pokedexId', null);
		const { data, error } = await query;
		if (error) {
			console.error('Failed to load export integrations:', error);
			throw new Error(`Failed to load export integrations: ${error.message}`);
		}
		if (!data) return [];
		// PostgREST rows are untyped without generated database types.
		return (data as PokedexExportIntegrationDB[]).map((row) => this.transform(row));
	}

	async updateTokens(
		id: string,
		patch: {
			accessToken?: string;
			refreshToken?: string | null;
			accessTokenExpiresAt?: string | null;
		}
	): Promise<void> {
		const query = this.supabase
			.from('pokedex_export_integrations')
			.update(patch)
			.eq('id', id)
			.eq('userId', this.userId);
		const { error } = this.pokedexId
			? await query.eq('pokedexId', this.pokedexId)
			: await query.is('pokedexId', null);

		if (error) {
			console.error('Failed to update export integration tokens:', error);
		}
	}

	/**
	 * Returns whether a row was updated. With `ifUpdatedAt`, the write only applies if the row is
	 * unchanged since it was read, so a stale export can't overwrite credentials a reconnect saved.
	 */
	async updateExportStatus(
		id: string,
		patch: {
			enabled?: boolean;
			lastExportedAt?: string | null;
			lastError?: string | null;
			metadata?: Record<string, unknown> | null;
			folderId?: string | null;
			path?: string | null;
		},
		ifUpdatedAt?: string
	): Promise<boolean> {
		let query = this.supabase
			.from('pokedex_export_integrations')
			.update(patch)
			.eq('id', id)
			.eq('userId', this.userId);
		if (ifUpdatedAt) query = query.eq('updatedAt', ifUpdatedAt);
		const scoped = this.pokedexId
			? query.eq('pokedexId', this.pokedexId)
			: query.is('pokedexId', null);
		const { data, error } = await scoped.select('id');

		if (error) {
			console.error('Failed to update export integration status:', error);
			return false;
		}
		return (data?.length ?? 0) > 0;
	}
}

export default PokedexExportIntegrationRepository;
