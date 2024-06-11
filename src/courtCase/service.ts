import { logger } from '@juriscrape/common'
import { type CourtCaseModel } from './model'
import { type CourtCaseRepository } from './repository'

interface CrawlCourtCasesReqBody {
  caseNumber: string
  processNumber: string
  originNumber: string
  court: string
}

// const crawlCourtCasesURL = `${process.env.TJ_CRAWLER_URL!}/crawl-court-cases`

const crawlerServicesURL: Record<string, string> = {
  TJAL: `${process.env.TJAL_ESAJ_URL!}/crawl-court-cases`,
  TJCE: `${process.env.TJCE_ESAJ_URL!}/crawl-court-cases`
}

export class CourtCaseService {
  private readonly courtMap: Record<string, string> = {
    '02': 'TJAL',
    '06': 'TJCE'
  }

  constructor (
    private readonly courtCaseRepository: CourtCaseRepository
  ) { }

  public async upsertMany (courtCases: CourtCaseModel[]): Promise<void> {
    if (!courtCases.length) return
    await this.courtCaseRepository.upsertMany(courtCases)
  }

  public async scheduleCourtCases (courtCases: CourtCaseModel[]): Promise<void> {
    if (!courtCases.length) return
    const pendingCourtCases: CourtCaseModel[] = courtCases.map(courtCase => ({ ...courtCase, crawlStatus: 'pending' }))
    await this.courtCaseRepository.upsertMany(pendingCourtCases)
  }

  public async getCourtCasesByCaseNumbers (caseNumbers: string[]): Promise<CourtCaseModel[]> {
    return await this.courtCaseRepository.findManyByCourtCaseNumbers(caseNumbers)
  }

  public async addCourtCasesToCrawlQueue (courtCases: CrawlCourtCasesReqBody[]): Promise<void> {
    console.log(courtCases.length)
    courtCases.forEach(async courtCase => {
      const url = crawlerServicesURL[courtCase.court]
      logger.info(`POST ${url}`)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([courtCase])
      })
      logger.info(`Status: ${response.status}`)
      logger.info(`Message: ${response.statusText}`)
    })
    // logger.info(`POST ${crawlCourtCasesURL}`)
    // const response = await fetch(crawlCourtCasesURL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(courtCases)
    // })
    // logger.info(`Status: ${response.status}`)
    // logger.info(`Message: ${response.statusText}`)
    // return response
  }

  public getCourtCasesStatus (caseNumbers: string[], courtCases: CourtCaseModel[]): Array<{ caseNumber: string, crawlStatus: string }> {
    const status = courtCases.map(courtCase => ({ caseNumber: courtCase.caseNumber, crawlStatus: courtCase.crawlStatus }))

    const caseNumbersNotInDatabase = caseNumbers.filter(caseNumber => !courtCases.find(courtCase => courtCase.caseNumber === caseNumber))
    caseNumbersNotInDatabase.forEach(caseNumber => status.push({ caseNumber, crawlStatus: 'scheduling' }))

    return status
  }

  public buildCourtCaseReqBody (caseNumbers: string[]): CrawlCourtCasesReqBody[] {
    return caseNumbers.map(caseNumber => ({
      caseNumber,
      processNumber: this.getProcessByCaseNumber(caseNumber),
      originNumber: this.getUnitOriginByCaseNumber(caseNumber),
      court: this.getCourtByCaseNumber(caseNumber)
    }))
  }

  private getCourtByCaseNumber (caseNumber: string): string {
    const matches = caseNumber.match(/\.(\d{2})\./)
    if (matches?.[1]) {
      return this.courtMap[matches[1]]
    } else {
      throw new Error('Court not recognized')
    }
  }

  /**
     * @description I'm calling process the initial part of the CaseNumber, this entire part NNNNNNN-DD.AAAA
    */
  private getProcessByCaseNumber (caseNumber: string): string {
    const matches = caseNumber.match(/(\d{7}.*\d{4})\./)
    if (matches?.[1]) {
      return matches[1]
    } else {
      throw new Error('Process not recognized')
    }
  }

  private getUnitOriginByCaseNumber (caseNumber: string): string {
    const matches = caseNumber.match(/(\d{4})$/)
    if (matches?.[1]) {
      return matches[1]
    } else {
      throw new Error('Unit Origin not recognized')
    }
  }
}
