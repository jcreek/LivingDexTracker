import type { RegionGameMapping } from '$lib/models/RegionGameMapping';

class RegionGameMappingRepository {
	async findById(id: string): Promise<RegionGameMapping | null> {
		void id;
		return null;
	}

	async findAll(): Promise<RegionGameMapping[]> {
		return [];
	}

	async create(data: Partial<RegionGameMapping>): Promise<RegionGameMapping | null> {
		if (!data.region || !data.game) return null;
		return {
			id: data.id,
			region: data.region,
			game: data.game
		};
	}

	async update(id: string, data: Partial<RegionGameMapping>): Promise<RegionGameMapping | null> {
		if (!data.region || !data.game) return null;
		const normalizedId = Number(id);
		const resolvedId = Number.isFinite(normalizedId) ? normalizedId : data.id;
		if (typeof resolvedId !== 'number' || !Number.isFinite(resolvedId)) return null;
		return {
			id: resolvedId,
			region: data.region,
			game: data.game
		};
	}

	async delete(id: string): Promise<void> {
		void id;
	}
}

export default RegionGameMappingRepository;
