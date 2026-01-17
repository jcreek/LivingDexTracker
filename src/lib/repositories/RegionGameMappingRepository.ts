import type { RegionGameMapping } from '$lib/models/RegionGameMapping';

class RegionGameMappingRepository {
	async findById(id: string): Promise<RegionGameMapping | null> {
		void id;
		return null;
	}

	async findAll(): Promise<RegionGameMapping[]> {
		return [];
	}

	async create(data: Partial<RegionGameMapping>): Promise<RegionGameMapping> {
		return {
			id: data.id,
			region: data.region ?? '',
			game: data.game ?? ''
		};
	}

	async update(id: string, data: Partial<RegionGameMapping>): Promise<RegionGameMapping | null> {
		void id;
		if (!data.region || !data.game) return null;
		return {
			id: data.id,
			region: data.region,
			game: data.game
		};
	}

	async delete(id: string): Promise<void> {
		void id;
	}
}

export default RegionGameMappingRepository;
