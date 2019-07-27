import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import taskController from './../controllers/taskController';
import { App } from '../../app';
import { UrlHelpers } from '../helpers/urlHelpers';

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

const getTaskViaProjectId = async (req: Request, res: Response) => {
    const projectId = UrlHelpers.getIdFromUlr(req.url);

    const response = await taskController.getViaProjectId(projectId, App.mongoDbOperations);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.post(asyncHandler(postTask));
rootRoute.get(asyncHandler(getTask));
rootRoute.patch(asyncHandler(patchTask));

const rootRouteWithId = router.route('/*');
rootRouteWithId.get(asyncHandler(getTaskViaProjectId));

export default router;
