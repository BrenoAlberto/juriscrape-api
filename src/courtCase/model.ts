export interface MovementModel {
  date?: string
  movement?: string
}

export interface PartyModel {
  name?: string
  layer?: string
  type?: string
}

export type Court = 'TJAL' | 'TJCE'

export type CrawlStatus = 'scheduling' | 'pending' | 'available'

export interface CaseData {
  court?: Court
  caseClass?: string
  area?: string
  subject?: string
  distributionDate?: string
  judge?: string
  actionValue?: number
  parties?: PartyModel[]
  movements?: MovementModel[]
}

export interface CourtCaseModel {
  caseNumber: string
  firstDegreeCaseData?: CaseData
  secondDegreeCaseData?: CaseData
  crawlStatus: CrawlStatus
}
