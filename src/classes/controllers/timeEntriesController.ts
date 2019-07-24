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
        extendedTimeEntry.startTime = new Date(extendedTimeEntry.startTime) as Date;
        console.log(typeof(extendedTimeEntry.startTime))

        return mongoDbOperations.insertOne(extendedTimeEntry, routesConfig.timEntriesCollectionName);
    },
    get(req: Request): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const queryObj: FilterQuery<any> = {};
        queryObj[routesConfig.isDeletedInClientProperty] = false;


        return mongoDbOperations.getFiltered(routesConfig.timEntriesCollectionName, queryObj);
    },
    patchStop(req: Request): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        // stop operation
        
        const idPropertyName = req.body[routesConfig.httpPatchIdPropertyName];
        const timeEntryId = req.body[routesConfig.httpPatchIdPropertyValue];
        // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
        const theQueryObj: FilterQuery<any>  = {};
        theQueryObj[idPropertyName] = timeEntryId;

        let propertyName = routesConfig.endDateProperty;
        let propertyValue: any = new Date();
        
        const firstPatchPromise = mongoDbOperations.patch(propertyName, propertyValue, routesConfig.timEntriesCollectionName, theQueryObj);

        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void)=>{
            firstPatchPromise.then((resolvedValue: any)=>{
                // TODO: in a later version: the duration between the timeStamps should be calculated in here
                resolve(resolvedValue);
                
                // propertyName = routesConfig.durationProperty;
                // propertyValue = null;
                // const secondPatchPromise = mongoDbOperations.patch(propertyName, propertyValue, routesConfig.timEntriesCollectionName, theQueryObj);
                // secondPatchPromise.then(resolve);
                // secondPatchPromise.catch(resolve);
            });
            firstPatchPromise.catch(()=>{
                const errMsg = 'catch when trying to patch the endDate in a timeEntry:' + timeEntryId; 
                console.error(errMsg);
                reject(errMsg);
            });
        });
    },
    patchDeletedInClient(req: Request): Promise<any> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const idPropertyName = req.body[routesConfig.httpPatchIdPropertyName];
        const timeEntryId = req.body[routesConfig.httpPatchIdPropertyValue];
        // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
        const theQueryObj: FilterQuery<any>  = {};
        theQueryObj[idPropertyName] = timeEntryId;

        const propertyName = routesConfig.isDeletedInClientProperty;
        const propertyValue = true;

        return mongoDbOperations.patch(propertyName, propertyValue, routesConfig.timEntriesCollectionName, theQueryObj);
    }
}