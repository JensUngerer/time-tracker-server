import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { App } from '../../app';
import bookingDeclarationController from '../controllers/bookingDeclarationController';
import routesConfig from './../../../../common/typescript/routes.js';

const router = express.Router();

const postBookingDeclaration = async (req: Request, res: Response) => {
    const response = await bookingDeclarationController.post(req, App.mongoDbOperations);

    res.json(response);
};

const getViaProjectId = async (req: Request, res: Response) => {
    const response = await bookingDeclarationController.getViaProjectId(req, App.mongoDbOperations);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.post(asyncHandler(postBookingDeclaration));

const getViaProjectIdRoute = router.route(routesConfig.bookingDeclarationsByProjectIdSuffix + '/*');
getViaProjectIdRoute.get(asyncHandler(getViaProjectId));

// DEBUGGING:
console.log(getViaProjectIdRoute.path);

export default router;
