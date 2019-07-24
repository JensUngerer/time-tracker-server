import { FilterQuery } from 'mongodb';
import { Request } from 'express';
import { ITimeEntry } from './../../../../common/typescript/iTimeEntry';
import routesConfig from './..&../../../../../../common/typescript/routes.js';
import { MonogDbOperations } from '../helpers/mongoDbOperations';
import { ITimeEntryDocument } from './../../../../common/typescript/mongoDB/iTimeEntryDocument';
import _ from 'lodash';

export default {
    post(req: Request): Promise<any> {
        const timeEntry: ITimeEntry = req.body[routesConfig.timeEntriesBodyProperty];

        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const extendedTimeEntry: ITimeEntryDocument = _.clone(timeEntry) as ITimeEntryDocument;
        extendedTimeEntry.isDeletedInClient = false;

        return mongoDbOperations.insertOne(extendedTimeEntry, routesConfig.timEntriesCollectionName);
    },
    get(req: Request): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const queryObj: FilterQuery<any> = {};
        queryObj[routesConfig.isDeletedInClientProperty] = false;


        return mongoDbOperations.getFiltered(routesConfig.timEntriesCollectionName, queryObj);
    },
    patch(req: Request): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();



        const propertyName = req.body[routesConfig.httpPatchIdPropertyToUpdateName];
        const propertyValue = req.body[routesConfig.httpPatchIdPropertyToUpdateValue];
        const idPropertyName = req.body[routesConfig.httpPatchIdPropertyName];
        const timeEntryId = req.body[routesConfig.httpPatchIdPropertyValue];

        // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
        const theQueryObj: FilterQuery<any>  = {};
        theQueryObj[idPropertyName] = timeEntryId;

        return mongoDbOperations.patch(propertyName, propertyValue, routesConfig.timEntriesCollectionName, theQueryObj);
    }
}