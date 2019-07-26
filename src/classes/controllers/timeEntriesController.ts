import { RequestProcessingHelpers } from './../helpers/requestProcessingHelpers';
import { TimeManagement } from './../helpers/timeManagement';
import { FilterQuery } from 'mongodb';
import { Request } from 'express';
import { ITimeEntry } from './../../../../common/typescript/iTimeEntry';
import routesConfig from './..&../../../../../../common/typescript/routes.js';
import { MonogDbOperations } from '../helpers/mongoDbOperations';
import { ITimeEntryDocument } from './../../../../common/typescript/mongoDB/iTimeEntryDocument';
import _ from 'lodash';
import { IPause } from '../../../../common/typescript/iPause';

export default {
    post(req: Request): Promise<any> {
        const timeEntry: ITimeEntry = req.body[routesConfig.timeEntriesBodyProperty];

        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const extendedTimeEntry: ITimeEntryDocument = _.clone(timeEntry) as ITimeEntryDocument;
        extendedTimeEntry.isDeletedInClient = false;
        extendedTimeEntry.startTime = new Date(extendedTimeEntry.startTime) as Date;
        
        // DEBUGGING string or object === date-object?
        // console.log(typeof (extendedTimeEntry.startTime))

        return mongoDbOperations.insertOne(extendedTimeEntry, routesConfig.timEntriesCollectionName);
    },
    get(req: Request, filterQuery?: FilterQuery<any>): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        if (!filterQuery) {
            const queryObj: FilterQuery<any> = {};
            queryObj[routesConfig.isDeletedInClientProperty] = false;

            return mongoDbOperations.getFiltered(routesConfig.timEntriesCollectionName, queryObj);
        } else {
            return mongoDbOperations.getFiltered(routesConfig.timEntriesCollectionName, filterQuery);
        }
    },
    patchStop(req: Request): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        // stop operation
        const theQueryObj = RequestProcessingHelpers.getFilerQuery(req);

        let propertyName = routesConfig.endDateProperty;
        let propertyValue: any = new Date();

        const firstPatchPromise = mongoDbOperations.patch(propertyName, propertyValue, routesConfig.timEntriesCollectionName, theQueryObj);

        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            firstPatchPromise.then((resolvedValue: any) => {
                resolve(resolvedValue);
            });
            firstPatchPromise.catch(() => {
                const errMsg = 'catch when trying to patch the endDate in a timeEntry:' + theQueryObj[req.body[routesConfig.httpPatchIdPropertyName]];
                console.error(errMsg);
                reject(errMsg);
            });
        });
    },
    patchTheDurationInTimeEntriesDocument(theSuccessfullyPatchDocumentsFromDB: ITimeEntryDocument[], req: Request): Promise<any> {
        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
            mongoDbOperations.prepareConnection();

            if (!theSuccessfullyPatchDocumentsFromDB || theSuccessfullyPatchDocumentsFromDB.length === 0) {
                console.error('cannot write the duration because retrieval of document failed');
                console.error(JSON.stringify(theSuccessfullyPatchDocumentsFromDB, null, 4));
                resolve(false);
                return;
            }

            const singleDoc = theSuccessfullyPatchDocumentsFromDB[0];

            // DEBUGGING:
            // if (typeof singleDoc.startTime === 'string') {
            //     console.error('starTime is string and not date!');
            // }
            // if (typeof singleDoc.endTime === 'string') {
            //     console.error('endTime is string and  not date');
            // }

            const propertyName = routesConfig.durationProperty;
            const propertyValue = TimeManagement.timeEntryToDuration(singleDoc);

            // DEBUGGING:
            // console.error(JSON.stringify(propertyValue, null, 4));
            // console.error(JSON.stringify(singleDoc, null, 4));

            
            const theQueryObj = RequestProcessingHelpers.getFilerQuery(req);

            const patchPromiseForWritingTheDuration = mongoDbOperations.patch(propertyName, propertyValue, routesConfig.timEntriesCollectionName, theQueryObj);
            patchPromiseForWritingTheDuration.then(resolve);
            patchPromiseForWritingTheDuration.catch(resolve);
        });
    },
    patchDeletedInClient(req: Request): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const idPropertyName = req.body[routesConfig.httpPatchIdPropertyName];
        const timeEntryId = req.body[routesConfig.httpPatchIdPropertyValue];
        // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
        const theQueryObj: FilterQuery<any> = {};
        theQueryObj[idPropertyName] = timeEntryId;

        const propertyName = routesConfig.isDeletedInClientProperty;
        const propertyValue = true;

        return mongoDbOperations.patch(propertyName, propertyValue, routesConfig.timEntriesCollectionName, theQueryObj);
    },
    postPause(req: Request): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const theQueryObj = RequestProcessingHelpers.getFilerQuery(req);

        const propertyName = routesConfig.pausesProperty;
        const propertyValue: IPause = {
            startTime: new Date(),
            endTime: null,
            duration: null
        };

        return mongoDbOperations.patchPush(propertyName, propertyValue, routesConfig.timEntriesCollectionName, theQueryObj);
    },
    patchPause(req: Request, documents: ITimeEntryDocument[]): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const theQueryObj = RequestProcessingHelpers.getFilerQuery(req);

        return mongoDbOperations.patchLastTimeEntryPause(theQueryObj, documents);
    },
    calculatePauseAndRewriteArrayToDocument(filterQuery: FilterQuery<any>, documents: ITimeEntryDocument[]) {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const storeDurationsInPausesPromise = mongoDbOperations.storeDurationInPausesOfDocument(filterQuery, documents);
        return storeDurationsInPausesPromise;
    }
}