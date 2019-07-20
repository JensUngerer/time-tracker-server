import { MonogDbOperations } from './../helpers/mongoDbOperations';
import { Request } from 'express';
import { ITimeRecordsDocument, ITimeRecordsDocumentData } from './../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import * as routes from '../../../../common/typescript/routes.js';

export default {
    /*async*/ post(req: Request): Promise<any> {

        // console.error('controller: '+ JSON.stringify(req));

        // console.error('controller');
        // const parsedBody = JSON.parse(req.);
        const line: ITimeRecordsDocument = req.body[routes.timeRecordBodyProperty];
        // console.error(JSON.stringify(line, null, 4));

        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();
        return mongoDbOperations.insertOne(line, routes.timeRecordsCollectionName);
    }
}