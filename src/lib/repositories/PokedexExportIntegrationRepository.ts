import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	PokedexExportIntegration,
	PokedexExportIntegrationDB
} from '$lib/models/PokedexExportIntegration';

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
			lastError: db.lastError
		};
	}

	private baseQuery() {
		return this.supabase.from('pokedex_export_integrations').select('*').eq('userId', this.userId);
	}

	private addPokedexScope(query: ReturnType<SupabaseClient['from']>) {
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
		return data.map((row) => this.transform(row));
	}

	async listAll(): Promise<PokedexExportIntegration[]> {
		const { data, error } = await this.addPokedexScope(this.baseQuery());

		if (error) {
			console.error('Failed to load export integrations:', error);
			throw new Error(`Failed to load export integrations: ${error.message}`);
		}
		if (!data) return [];
		return data.map((row) => this.transform(row));
	}

	async upsert(
		data: Partial<PokedexExportIntegrationDB> &
			Pick<PokedexExportIntegrationDB, 'provider'>
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
		return data.map((row) => this.transform(row));
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

	async updateExportStatus(
		id: string,
		patch: {
			lastExportedAt?: string | null;
			lastError?: string | null;
			metadata?: Record<string, unknown> | null;
			folderId?: string | null;
			path?: string | null;
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
			console.error('Failed to update export integration status:', error);
		}
	}
}

export default PokedexExportIntegrationRepository;
