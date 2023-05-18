import { Collection, Db, WithId } from "mongodb"
import { CourtCaseModel } from "./model"

export class CourtCaseRepository {
    private collection: Collection<CourtCaseModel>

    constructor(db: Db) {
        this.collection = db.collection("courtCases")
        this.collection.createIndex({ caseNumber: 1 })
    }

    async upsertMany(courtCases: CourtCaseModel[]): Promise<void> {
        const operations = courtCases.map(courtCase => ({
            replaceOne: {
                filter: { caseNumber: courtCase.caseNumber },
                replacement: courtCase,
                upsert: true,
            },
        }))

        await this.collection.bulkWrite(operations)
    }

    async findByCourtCaseNumber(caseNumber: string): Promise<WithId<CourtCaseModel> | null> {
        return this.collection.findOne({ caseNumber })
    }

    async findManyByCourtCaseNumbers(caseNumbers: string[]): Promise<WithId<CourtCaseModel>[]> {
        return this.collection.find({ caseNumber: { $in: caseNumbers } }).toArray()
    }
}
