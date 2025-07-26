import PokedexEntryModel, { type PokedexEntry } from '$lib/models/PokedexEntry';
import CatchRecordModel, { type CatchRecord } from '$lib/models/CatchRecord';
import { type CombinedData } from '$lib/models/CombinedData';

class CombinedDataRepository {
	async findAllCombinedData(
		userId: string,
		enableForms: boolean = true,
		region: string = '',
		game: string = ''
	): Promise<CombinedData[]> {
		const pipeline: any[] = [
			{
				$lookup: {
					from: 'catchrecords',
					let: { entryId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$pokedexEntryId', '$$entryId'] },
										{ $eq: ['$userId', userId] }
									]
								}
							}
						}
					],
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
			}
		];

		if (!enableForms) {
			pipeline.unshift({
				$match: {
					'boxPlacement.box': { $ne: null }
				}
			});
		}

		if (region.length > 0) {
			pipeline.unshift({
				$match: {
					regionToCatchIn: region
				}
			});
		}

		if (game.length > 0) {
			pipeline.unshift({
				$match: {
					gamesToCatchIn: { $in: [game] }
				}
			});
		}

		const combinedData: CombinedData[] = await PokedexEntryModel.aggregate(pipeline).exec();

		return combinedData.map((data) => ({
			pokedexEntry: data as PokedexEntry,
			catchRecord: data.catchRecord as CatchRecord
		}));
	}

	async findCombinedData(
		userId: string,
		page: number = 1,
		limit: number = 20,
		enableForms: boolean = true,
		region: string = '',
		game: string = ''
	): Promise<CombinedData[]> {
		const skip = (page - 1) * limit;
		const pipeline: any[] = [
			{
				$lookup: {
					from: 'catchrecords',
					let: { entryId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$pokedexEntryId', '$$entryId'] },
										{ $eq: ['$userId', userId] }
									]
								}
							}
						}
					],
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

		if (region.length > 0) {
			pipeline.unshift({
				$match: {
					regionToCatchIn: region
				}
			});
		}

		if (game.length > 0) {
			pipeline.unshift({
				$match: {
					gamesToCatchIn: { $in: [game] }
				}
			});
		}

		const combinedData: CombinedData[] = await PokedexEntryModel.aggregate(pipeline).exec();

		return combinedData.map((data) => ({
			pokedexEntry: data as PokedexEntry,
			catchRecord: data.catchRecord as CatchRecord
		}));
	}

	async countCombinedData(userId: string, enableForms: boolean, region: string, game: string): Promise<number> {
		const pipeline: any[] = [
			{
				$lookup: {
					from: 'catchrecords',
					let: { entryId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$pokedexEntryId', '$$entryId'] },
										{ $eq: ['$userId', userId] }
									]
								}
							}
						}
					],
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
				$count: 'total'
			}
		];

		if (!enableForms) {
			pipeline.unshift({
				$match: {
					'boxPlacement.box': { $ne: null }
				}
			});
		}

		if (region.length > 0) {
			pipeline.unshift({
				$match: {
					regionToCatchIn: region
				}
			});
		}

		if (game.length > 0) {
			pipeline.unshift({
				$match: {
					gamesToCatchIn: { $in: [game] }
				}
			});
		}

		try {
			const result = await PokedexEntryModel.aggregate(pipeline).exec();
			return result.length > 0 ? result[0].total : 0;
		} catch (error) {
			console.error('Error counting documents:', error);
			throw error;
		}
	}
}

export default CombinedDataRepository;
