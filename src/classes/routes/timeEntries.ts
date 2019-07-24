import asyncHandler from 'express-async-handler';

import express, { Request, Response } from 'express';

import timeEntriesController from './../controllers/timeEntriesController';

const router = express.Router();

const getTimeEntries = async (req: Request, res: Response) => {
    const response = await timeEntriesController.get(req);

    res.json(response);
};

const postTimeEntries = async (req: Request, res: Response) => {
    const response = await timeEntriesController.post(req);

    res.json(response);
};

const patchTimeEntries = async (req: Request, res: Response) => {
    const response = await timeEntriesController.patch(req);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.get(asyncHandler(getTimeEntries));
rootRoute.post(asyncHandler(postTimeEntries));
rootRoute.patch(asyncHandler(patchTimeEntries));

export default router;
