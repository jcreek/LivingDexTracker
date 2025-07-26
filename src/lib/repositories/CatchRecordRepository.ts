import CatchRecordModel, { type CatchRecord } from '$lib/models/CatchRecord';

class CatchRecordRepository {
	async findById(id: string): Promise<CatchRecord | null> {
		return CatchRecordModel.findById(id).exec();
	}

	async findAll(): Promise<CatchRecord[]> {
		return CatchRecordModel.find().exec();
	}

	async findByUserId(userId: string): Promise<CatchRecord[]> {
		return CatchRecordModel.find({ userId }).exec();
	}

	async create(data: Partial<CatchRecord>): Promise<CatchRecord> {
		return CatchRecordModel.create(data);
	}

	async update(id: string, data: Partial<CatchRecord>): Promise<CatchRecord | null> {
		return CatchRecordModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async delete(id: string): Promise<void> {
		await CatchRecordModel.findByIdAndDelete(id).exec();
	}

	async upsert(data: Partial<CatchRecord>): Promise<CatchRecord | null> {
		if (data._id) {
			// Update existing record
			return CatchRecordModel.findByIdAndUpdate(data._id, data, { new: true }).exec();
		} else {
			// Create new record
			return CatchRecordModel.create(data);
		}
	}
}

export default CatchRecordRepository;
