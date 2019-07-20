import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import taskController from './../controllers/taskController';

const router = express.Router();

const postProject = async (req: Request, res: Response) => {
    const response = await taskController.post(req);

    res.json(response);
};

router.route('/').post(asyncHandler(postProject));
export default router;
