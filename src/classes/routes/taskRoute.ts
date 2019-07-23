import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import taskController from './../controllers/taskController';

const router = express.Router();

const postTask = async (req: Request, res: Response) => {
    const response = await taskController.post(req);

    res.json(response);
};

const getTask = async (req: Request, res: Response) => {
    const response = await taskController.get(req);

    res.json(response);
};

const patchTask = async (req: Request, res: Response) => {
    const response = await taskController.patch(req);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.post(asyncHandler(postTask));
rootRoute.get(asyncHandler(getTask));
rootRoute.patch(asyncHandler(patchTask));
export default router;
