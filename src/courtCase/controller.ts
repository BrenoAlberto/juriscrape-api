import { Request, Response } from 'express';
import { CourtCaseService } from './service';
import { CourtCaseModel } from './model';

export class CourtCaseController {
    constructor(private courtCaseService: CourtCaseService) { }

    async addCourtCasesToCrawlQueue(req: Request, res: Response): Promise<Response> {
        try {
            const caseNumbers = req.body.caseNumbers as string[];
            const courtCases = await this.courtCaseService.getCourtCasesByCaseNumbers(caseNumbers);
            const courtCasesWithStatus = this.courtCaseService.getCourtCasesStatus(caseNumbers, courtCases);
            const schedulingCourtCases = courtCasesWithStatus.filter(courtCase => courtCase.crawlStatus === "scheduling");
            await this.courtCaseService.scheduleCourtCases(schedulingCourtCases as CourtCaseModel[]);
            const courtCasesToCrawl = this.courtCaseService.buildCourtCaseReqBody(schedulingCourtCases.map(courtCase => courtCase.caseNumber));
            await this.courtCaseService.addCourtCasesToCrawlQueue(courtCasesToCrawl);
            return res.status(200).json(courtCasesWithStatus);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while adding cases to crawl queue' });
        }
    }

    async getCourtCasesByCaseNumbers(req: Request, res: Response): Promise<Response> {
        try {
            const caseNumbers = req.body.caseNumbers as string[];
            const courtCases = await this.courtCaseService.getCourtCasesByCaseNumbers(caseNumbers);
            return res.status(200).json(courtCases);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while getting court cases' });
        }
    }

    async insertCourtCases(req: Request, res: Response): Promise<Response> {
        try {
            const courtCases = req.body as CourtCaseModel[];
            await this.courtCaseService.upsertMany(courtCases);
            return res.status(200).json({ message: 'Court cases inserted successfully' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while inserting court cases' });
        }
    }

}
