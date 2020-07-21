import { MonogDbOperations } from './../helpers/mongoDbOperations';
import { Request } from 'express';
import routes from '../../../../common/typescript/routes.js';
import {IBookingDeclaration} from './../../../../common/typescript/iBookingDeclaration';
import { UrlHelpers } from '../helpers/urlHelpers';
import { FilterQuery } from 'mongodb';

export default {
    post(req: Request, mongoDbOperations: MonogDbOperations) {
        const bookingDeclaration: IBookingDeclaration = req.body[routes.bookingDeclarationProperty];

        return mongoDbOperations.insertOne(bookingDeclaration, routes.bookingDeclarationsCollectionName);
    },
    getViaId(req: Request, mongoDbOperations: MonogDbOperations) {
        const bookingDeclarationId = UrlHelpers.getIdFromUlr(req.url);
        const queryObj: FilterQuery<any> = {};
        queryObj[routes.bookingDeclarationBookingDeclarationIdProperty] = bookingDeclarationId;

        return mongoDbOperations.getFiltered(routes.bookingDeclarationsCollectionName, queryObj);
    },
    getViaProjectId(req: Request, mongoDbOperations: MonogDbOperations) {
        const projectId = UrlHelpers.getIdFromUlr(req.url);
        const queryObj: FilterQuery<any> = {};
        queryObj[routes.bookingDeclarationProjectIdsProperty] = projectId;
        // https://stackoverflow.com/questions/18148166/find-document-with-array-that-contains-a-specific-value
        // https://docs.mongodb.com/manual/tutorial/query-arrays/
        return mongoDbOperations.getFiltered(routes.bookingDeclarationsCollectionName, queryObj);
    }
}