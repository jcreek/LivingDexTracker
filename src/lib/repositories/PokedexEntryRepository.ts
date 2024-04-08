import PokedexEntryModel, { type PokedexEntry } from '$lib/models/PokedexEntry';

class PokedexEntryRepository {
	async findById(id: string): Promise<PokedexEntry | null> {
		return PokedexEntryModel.findById(id).exec();
	}

	async findAll(): Promise<PokedexEntry[]> {
		return PokedexEntryModel.find().exec();
	}

	async create(data: Partial<PokedexEntry>): Promise<PokedexEntry> {
		return PokedexEntryModel.create(data);
	}

	async update(id: string, data: Partial<PokedexEntry>): Promise<PokedexEntry | null> {
		return PokedexEntryModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async delete(id: string): Promise<void> {
		await PokedexEntryModel.findByIdAndDelete(id).exec();
	}
}

export default PokedexEntryRepository;
