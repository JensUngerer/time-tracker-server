import { RequestProcessingHelpers } from './../helpers/requestProcessingHelpers';
import { FilterQuery } from 'mongodb';
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

    // DEBUGGING:
    // console.error(JSON.stringify(response, null, 4));
    // console.error('writing duration in db');

    const filterQuery = RequestProcessingHelpers.getFilerQuery(req);
    const theDocuments: any[] = await timeEntriesController.get(req, filterQuery);
    
    // DEBUGGING
    // console.error(JSON.stringify(theDocuments, null, 4));
    // console.error('calling the patch-method');
    
    const durationInDbResponse = await timeEntriesController.patchTheDurationInTimeEntriesDocument(theDocuments, req);
    
    // DEBUGGING:
    // console.error(JSON.stringify(durationInDbResponse, null, 4));

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
    const filterQuery = RequestProcessingHelpers.getFilerQuery(req);
    const storedDocuments = await timeEntriesController.get(req, filterQuery);

    // DEBUGGING:
    // console.error(JSON.stringify(storedDocuments, null, 4));
    // console.error('the storedDocuments');

    const response = await timeEntriesController.patchPause(req, storedDocuments);

    // // DEBUGGING:
    // console.error(JSON.stringify(response, null, 4));
    // console.error('calling doSomething');

    const anotherTimeTheStoredDocuments = await timeEntriesController.get(req, filterQuery);


    // DEBUGGING:
    console.error(JSON.stringify(anotherTimeTheStoredDocuments, null, 4));
    console.error('calling do something');

    const doSomethingResponse = await timeEntriesController.doSomething(filterQuery, anotherTimeTheStoredDocuments);

    // DEBUGGING:
    console.error('doSomethingResponse');
    console.error(JSON.stringify(doSomethingResponse, null, 4));

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
