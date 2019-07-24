import { Request } from 'express';
import routesConfig from './../../../../common/typescript/routes.js';
import { FilterQuery } from 'mongodb';

export class RequestProcessingHelpers {
    public static getFilerQuery(req: Request): FilterQuery<any> {
        const idPropertyName = req.body[routesConfig.httpPatchIdPropertyName];
        const timeEntryId = req.body[routesConfig.httpPatchIdPropertyValue];
        // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
        const theQueryObj: FilterQuery<any> = {};
        theQueryObj[idPropertyName] = timeEntryId;

        return theQueryObj;
    }
}