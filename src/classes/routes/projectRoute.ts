import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import projectController from './../controllers/projectController';
import { App } from '../../app';

const router = express.Router();

const postProject = async (req: Request, res: Response) => {
    const response = await projectController.post(req, App.mongoDbOperations);

    res.json(response);
};

const getProject = async (req: Request, res: Response) => {
    const response = await projectController.get(req, App.mongoDbOperations);

    res.json(response);
};

const patchProject = async (req: Request, res: Response) => {
    const response = await projectController.patch(req, App.mongoDbOperations);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.post(asyncHandler(postProject));
rootRoute.get(asyncHandler(getProject));
rootRoute.patch(asyncHandler(patchProject));
export default router;
