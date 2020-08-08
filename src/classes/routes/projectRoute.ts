import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import projectController from './../controllers/projectController';
import { App } from '../../app';
import { Serialization } from '../../../../common/typescript/helpers/serialization';

const router = express.Router();

const postProject = async (req: Request, res: Response) => {
    const response = await projectController.post(req, App.mongoDbOperations);
    const stringifiedResponse = Serialization.serialize(response);
    res.send(stringifiedResponse);
};

const getProject = async (req: Request, res: Response) => {
    const response = await projectController.get(req, App.mongoDbOperations);
    const stringifiedResponse = Serialization.serialize(response);
    res.send(stringifiedResponse);
};

const patchProject = async (req: Request, res: Response) => {
    const response = await projectController.patch(req, App.mongoDbOperations);
    const stringifiedResponse = Serialization.serialize(response);
    res.send(stringifiedResponse);
};

const rootRoute = router.route('/');
rootRoute.post(asyncHandler(postProject));
rootRoute.get(asyncHandler(getProject));
rootRoute.patch(asyncHandler(patchProject));
export default router;
