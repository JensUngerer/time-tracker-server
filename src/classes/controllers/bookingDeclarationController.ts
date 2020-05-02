import { MonogDbOperations } from './../helpers/mongoDbOperations';
import { Request } from 'express';
import routes from '../../../../common/typescript/routes.js';
import {IBookingDeclaration} from './../../../../common/typescript/iBookingDeclaration';

export default {
    post(req: Request, mongoDbOperations: MonogDbOperations) {
        const bookingDeclaration: IBookingDeclaration = req.body[routes.bookingDeclarationProperty];

        return mongoDbOperations.insertOne(bookingDeclaration, routes.bookingDeclarationsCollectionName);
    }
}