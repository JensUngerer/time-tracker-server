import asyncHandler from 'express-async-handler';

import express, { Request, Response } from 'express';

import timeEntriesController from './../controllers/timeEntriesController';

import routesConfig from './../../../../common/typescript/routes.js';

const router = express.Router();

const getTimeEntries = async (req: Request, res: Response) => {
    const response = await timeEntriesController.get(req);

    res.json(response);
};

const postTimeEntries = async (req: Request, res: Response) => {
    const response = await timeEntriesController.post(req);

    res.json(response);
};

const patchTimeEntriesStop = async (req: Request, res: Response) => {
    const response = await timeEntriesController.patchStop(req);

    res.json(response);
};

const patchTimeEntriesDelete = async (req: Request, res: Response) => {
    const response = await timeEntriesController.patchDeletedInClient(req);

    res.json(response);
};

const postPauseTimeEntry = async (req: Request, res: Response) => {
    const response = await timeEntriesController.postPause(req);

    res.json(response);
};

const patchPauseTimeEntry = async (req: Request, res: Response) => {
    const response = await timeEntriesController.patchPause(req);

    res.json(response);
};

const rootRoute = router.route('/');
rootRoute.get(asyncHandler(getTimeEntries));
rootRoute.post(asyncHandler(postTimeEntries));

const stopRoute = router.route(routesConfig.timeEntriesStopPathSuffix);
stopRoute.patch(asyncHandler(patchTimeEntriesStop));

const deleteRoute = router.route(routesConfig.timeEntriesDeletePathSuffix);
deleteRoute.patch(asyncHandler(patchTimeEntriesDelete));

const pauseRoute = router.route(routesConfig.timeEntryPausePathSuffix);
pauseRoute.post(asyncHandler(postPauseTimeEntry));
pauseRoute.patch(asyncHandler(patchPauseTimeEntry));

export default router;
