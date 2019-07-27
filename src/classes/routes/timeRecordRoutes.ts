import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import timeRecordController from '../controllers/timeRecordController'; // cont
import { App } from '../../app';
import routes = require('../../../../common/typescript/routes');
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';

// https://github.com/linnovate/mean/blob/master/server/routes/user.route.js

const router = express.Router();

const postTimeRecord = async (req: Request, res: Response) => {
    const line: ITimeRecordsDocumentData = req.body[routes.timeRecordBodyProperty];
    
    // a) write into db
    const timeRecordPostResponse = await timeRecordController.post(line, App.mongoDbOperations);
        
    // b) mark timeEntries as isDeletedInClient
    const markAsDeletedResult = await timeRecordController.markTimeEntriesAsDeleted(line._timeEntryIds, App.mongoDbOperations);

    res.json(markAsDeletedResult);
};

router.route('/').post(asyncHandler(postTimeRecord))

export default router;
