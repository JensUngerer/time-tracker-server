import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { App } from '../../app';
import bookingDeclarationController from '../controllers/bookingDeclarationController';

const router = express.Router();

const postBookingDeclaration = async (req: Request, res: Response) => {
    const response = await bookingDeclarationController.post(req, App.mongoDbOperations);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.post(asyncHandler(postBookingDeclaration));

export default router;
