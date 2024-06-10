import { type Request, type Response } from 'express'
import { type CourtCaseService } from './service'
import { type CourtCaseModel } from './model'
import { logger } from '@juriscrape/common'

export class CourtCaseController {
  constructor (private readonly courtCaseService: CourtCaseService) { }

  async addCourtCasesToCrawlQueue (req: Request, res: Response): Promise<Response> {
    try {
      const caseNumbers = req.body.caseNumbers as string[]
      const courtCases = await this.courtCaseService.getCourtCasesByCaseNumbers(caseNumbers)
      const courtCasesWithStatus = this.courtCaseService.getCourtCasesStatus(caseNumbers, courtCases)
      const schedulingCourtCases = courtCasesWithStatus.filter(courtCase => courtCase.crawlStatus === 'scheduling')
      await this.courtCaseService.scheduleCourtCases(schedulingCourtCases as CourtCaseModel[])
      const courtCasesToCrawl = this.courtCaseService.buildCourtCaseReqBody(schedulingCourtCases.map(courtCase => courtCase.caseNumber))
      // TODO: case of failure
      await this.courtCaseService.addCourtCasesToCrawlQueue(courtCasesToCrawl)
      return res.status(200).json(courtCasesWithStatus)
    } catch (err) {
      logger.error(err)
      return res.status(500).json({ message: 'An error occurred while adding cases to crawl queue' })
    }
  }

  async getCourtCasesByCaseNumbers (req: Request, res: Response): Promise<Response> {
    try {
      const caseNumbers = req.body.caseNumbers as string[]
      const courtCases = await this.courtCaseService.getCourtCasesByCaseNumbers(caseNumbers)
      return res.status(200).json(courtCases)
    } catch (err) {
      logger.error(err)
      return res.status(500).json({ message: 'An error occurred while getting court cases' })
    }
  }

  async insertCourtCases (req: Request, res: Response): Promise<Response> {
    try {
      const courtCases = req.body as CourtCaseModel[]
      courtCases.forEach(courtCase => {
        logger.info(`Inserting court case ${courtCase.caseNumber}`)
      })
      await this.courtCaseService.upsertMany(courtCases)
      return res.status(200).json({ message: 'Court cases inserted successfully' })
    } catch (err) {
      logger.error(err)
      return res.status(500).json({ message: 'An error occurred while inserting court cases' })
    }
  }
}
