import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import taskController from './../controllers/taskController';
import { App } from '../../app';

const router = express.Router();

const postTask = async (req: Request, res: Response) => {
    const response = await taskController.post(req, App.mongoDbOperations);

    res.json(response);
};

const getTask = async (req: Request, res: Response) => {
    const response = await taskController.get(req, App.mongoDbOperations);

    res.json(response);
};

const patchTask = async (req: Request, res: Response) => {
    const response = await taskController.patch(req, App.mongoDbOperations);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.post(asyncHandler(postTask));
rootRoute.get(asyncHandler(getTask));
rootRoute.patch(asyncHandler(patchTask));
export default router;
