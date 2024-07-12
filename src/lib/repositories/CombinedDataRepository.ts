import PokedexEntryModel, { type PokedexEntry } from '$lib/models/PokedexEntry';
import CatchRecordModel, { type CatchRecord } from '$lib/models/CatchRecord';
import { CombinedData } from '$lib/models/CombinedData';

class CombinedDataRepository {
	async findCombinedData(page: number = 1, limit: number = 20): Promise<CombinedData[]> {
		const skip = (page - 1) * limit;
		const combinedData: CombinedData[] = await PokedexEntryModel.aggregate([
			{
				$lookup: {
					from: 'catchrecords',
					localField: '_id',
					foreignField: 'pokedexEntryId',
					as: 'catchRecord'
				}
			},
			{
				$unwind: {
					path: '$catchRecord',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$sort: {
					'boxPlacement.box': 1,
					'boxPlacement.row': 1,
					'boxPlacement.column': 1
				}
			},
			{ $skip: skip },
			{ $limit: limit }
		]).exec();

		return combinedData.map((data) => ({
			pokedexEntry: data as PokedexEntry,
			catchRecord: data.catchRecord as CatchRecord
		}));
	}

	async countCombinedData(): Promise<number> {
		return PokedexEntryModel.countDocuments().exec();
	}
}

export default CombinedDataRepository;
