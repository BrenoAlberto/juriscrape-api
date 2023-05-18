require('dotenv').config();

import express from 'express';
import { CourtCaseRepository } from './courtCase/repository';
import { CourtCaseService } from './courtCase/service';
import { CourtCaseController } from './courtCase/controller';
import { getDb, initializeDb } from './db';


const app = express();
app.use(express.json());

initializeDb().then(() => {
    const db = getDb();
    const courtCaseRepository = new CourtCaseRepository(db);
    const courtCaseService = new CourtCaseService(courtCaseRepository);
    const courtCaseController = new CourtCaseController(courtCaseService);

    app.post('/fetch-court-cases', (req, res) => courtCaseController.addCourtCasesToCrawlQueue(req, res));
    app.post('/insert-court-cases', (req, res) => courtCaseController.insertCourtCases(req, res));
    app.post('/get-court-cases', (req, res) => courtCaseController.getCourtCasesByCaseNumbers(req, res));

    app.listen(3000, () => console.log('Server is running on port 3000'));
});
