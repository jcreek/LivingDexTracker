import PokedexEntryModel, { type PokedexEntry } from '$lib/models/PokedexEntry';
import CatchRecordModel, { type CatchRecord } from '$lib/models/CatchRecord';
import { CombinedData } from '$lib/models/CombinedData';

class CombinedDataRepository {
	async findCombinedData(
		page: number = 1,
		limit: number = 20,
		enableForms: boolean = true
	): Promise<CombinedData[]> {
		const skip = (page - 1) * limit;
		const pipeline: any[] = [
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
					'boxPlacementForms.box': 1,
					'boxPlacementForms.row': 1,
					'boxPlacementForms.column': 1
				}
			},
			{ $skip: skip },
			{ $limit: limit }
		];

		if (!enableForms) {
			pipeline.unshift({
				$match: {
					'boxPlacement.box': { $ne: null }
				}
			});
		}

		const combinedData: CombinedData[] = await PokedexEntryModel.aggregate(pipeline).exec();

		// Filter out entries with no catch records
		const filteredData = combinedData.filter((data) => data.catchRecord);

		return filteredData.map((data) => ({
			pokedexEntry: data as PokedexEntry,
			catchRecord: data.catchRecord as CatchRecord
		}));
	}

	async countCombinedData(enableForms: boolean): Promise<number> {
		const filter: any = {};

		if (!enableForms) {
			filter['boxPlacement.box'] = { $ne: null };
		}

		return PokedexEntryModel.countDocuments(filter).exec();
	}
}

export default CombinedDataRepository;
