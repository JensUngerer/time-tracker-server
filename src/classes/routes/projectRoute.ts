import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import projectController from './../controllers/projectController';

const router = express.Router();

const postProject = async (req: Request, res: Response) => {
    const response = await projectController.post(req);

    res.json(response);
};

const getProject = async (req: Request, res: Response) => {
    console.error('getProject');
    const response = await projectController.get(req);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.post(asyncHandler(postProject));
rootRoute.get(asyncHandler(getProject));
export default router;
