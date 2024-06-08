import { type Collection, type Db, type WithId } from 'mongodb'
import { type CourtCaseModel } from './model'

export class CourtCaseRepository {
  private readonly collection: Collection<CourtCaseModel>

  constructor (db: Db) {
    this.collection = db.collection('courtCases')
    void this.collection.createIndex({ caseNumber: 1 })
  }

  async upsertMany (courtCases: CourtCaseModel[]): Promise<void> {
    const operations = courtCases.map(courtCase => ({
      replaceOne: {
        filter: { caseNumber: courtCase.caseNumber },
        replacement: courtCase,
        upsert: true
      }
    }))

    await this.collection.bulkWrite(operations)
  }

  async findByCourtCaseNumber (caseNumber: string): Promise<WithId<CourtCaseModel> | null> {
    return await this.collection.findOne({ caseNumber })
  }

  async findManyByCourtCaseNumbers (caseNumbers: string[]): Promise<Array<WithId<CourtCaseModel>>> {
    return await this.collection.find({ caseNumber: { $in: caseNumbers } }).toArray()
  }
}
