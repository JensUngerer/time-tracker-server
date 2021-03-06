import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import timeRecordController from '../controllers/timeRecordController'; // cont
import { App } from '../../app';
import routes = require('../../../../common/typescript/routes');
import { ITimeRecordsDocumentData } from '../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import { Serialization } from '../../../../common/typescript/helpers/serialization';

// https://github.com/linnovate/mean/blob/master/server/routes/user.route.js

const router = express.Router();

const postTimeRecord = async (req: Request, res: Response) => {
    const body = Serialization.deSerialize<any>(req.body);

    const line: ITimeRecordsDocumentData = body[routes.timeRecordBodyProperty];
    const collectionName: string = body[routes.collectionNamePropertyName];
    // DEBUGGING:
    // console.log(JSON.stringify(line, null, 4));

    // a) write into db
    const timeRecordPostResponse = await timeRecordController.post(collectionName, line, App.mongoDbOperations);
        
    // b) mark timeEntries as isDeletedInClient
    let markAsDeletedResult = null;
    if (collectionName === routes.timeRecordsCollectionName) {
        markAsDeletedResult = await timeRecordController.markTimeEntriesAsDeleted(routes.isDeletedInClientProperty, line._timeEntryIds, App.mongoDbOperations);
    } else if(collectionName === routes.commitTimeRecordsCollectionName) {
        markAsDeletedResult = await timeRecordController.markTimeEntriesAsDeleted(routes.isDisabledInCommit, line._timeEntryIds, App.mongoDbOperations);
    } else {
        console.error(collectionName);
    }

    res.json(markAsDeletedResult);
};

router.route('/').post(asyncHandler(postTimeRecord))

export default router;
