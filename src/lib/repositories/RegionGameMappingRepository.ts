import RegionGameMappingModel, { type RegionGameMapping } from '$lib/models/RegionGameMapping';

class RegionGameMappingRepository {
	async findById(id: string): Promise<RegionGameMapping | null> {
		return RegionGameMappingModel.findById(id).exec();
	}

	async findAll(): Promise<RegionGameMapping[]> {
		return RegionGameMappingModel.find().exec();
	}

	async create(data: Partial<RegionGameMapping>): Promise<RegionGameMapping> {
		return RegionGameMappingModel.create(data);
	}

	async update(id: string, data: Partial<RegionGameMapping>): Promise<RegionGameMapping | null> {
		return RegionGameMappingModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async delete(id: string): Promise<void> {
		await RegionGameMappingModel.findByIdAndDelete(id).exec();
	}
}

export default RegionGameMappingRepository;
