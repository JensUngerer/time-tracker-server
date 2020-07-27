import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { FilterQuery } from 'mongodb';

import { IBookingDeclaration } from '../../../../common/typescript/iBookingDeclaration';
import { ITimeEntryDocument } from '../../../../common/typescript/mongoDB/iTimeEntryDocument';
import { App } from '../../app';
import { IDurationSum } from './../../../../common/typescript/iDurationSum';
import routesConfig from './../../../../common/typescript/routes.js';
import timeEntriesController from './../controllers/timeEntriesController';
import { RequestProcessingHelpers } from './../helpers/requestProcessingHelpers';
import { UrlHelpers } from './../helpers/urlHelpers';
import { ITasksDurationSum } from './../../../../common/typescript/iTasksDurationSum';
import { CalculateDurationsByDay } from '../helpers/calculateDurationsByDay';
import { ITask } from '../../../../common/typescript/iTask';
import taskController from './../controllers/taskController';

const router = express.Router();

const getViaTaskId = async (req: Request, res: Response) => {
    const taskId = UrlHelpers.getIdFromUlr(req.url);
    const filterQuery: FilterQuery<any> = {};
    filterQuery[routesConfig.endDateProperty] = null;
    filterQuery[routesConfig.taskIdPropertyAsForeignKey] = taskId;
    const response = await timeEntriesController.get(req, App.mongoDbOperations, filterQuery);

    res.json(response);
};

const getTimeEntries = async (req: Request, res: Response) => {
    const response = await timeEntriesController.get(req, App.mongoDbOperations);

    res.json(response);
};

/**
 * 1)
 * HTTP-POST /NodeJS/timeEntries + '/' -> a timeEntries-document will be created
 * 
 * @param req 
 * @param res 
 */
const postTimeEntries = async (req: Request, res: Response) => {
    const response = await timeEntriesController.post(req, App.mongoDbOperations);

    res.json(response);
};

/**
 * 4)
 * HTTP-PATCH /NodeJS/timeEntries + '/stop' -> a timeEntries-document will be updated
 * 
 * a) update the current (single!) document with a new endTime-property
 * b) get the current (single!) document via its timeEntryId
 * c) calculate the entire duration based on current (single!) document
 * d) patch the endTime-property with that value
 * 
 * @param req
 * @param res 
 */
const patchTimeEntriesStop = async (req: Request, res: Response) => {
    // a)
    const patchedEndTime = await timeEntriesController.patchStop(req, App.mongoDbOperations);

    // DEBUGGING:
    // console.log('patchedEndTime:' + patchedEndTime);

    const patchDayResult = await timeEntriesController.patchDay(req, App.mongoDbOperations, patchedEndTime);

    // DEBUGGING:
    // console.log(JSON.stringify(patchDayResult, null, 4));

    // DEBUGGING:
    // console.error(JSON.stringify(response, null, 4));
    // console.error('writing duration in db');

    //b)
    const filterQuery = RequestProcessingHelpers.getFilerQuery(req);
    const theDocuments: any[] = await timeEntriesController.get(req, App.mongoDbOperations, filterQuery);

    // DEBUGGING
    // console.error(JSON.stringify(theDocuments, null, 4));
    // console.error('calling the patch-method');

    // c) and d)
    const durationInDbResponse = await timeEntriesController.patchTheDurationInTimeEntriesDocument(App.mongoDbOperations, theDocuments, req);

    // DEBUGGING:
    // console.error(JSON.stringify(durationInDbResponse, null, 4));

    res.json(durationInDbResponse);
};

/**
 * 5)
 * HTTP-PATCH /NodeJS/timeEntries + '/delete' -> a timeEntries document is updated (and so marked as isDeletedInClient)
 * @param req 
 * @param res 
 */
const patchTimeEntriesDelete = async (req: Request, res: Response) => {
    const response = await timeEntriesController.patchDeletedInClient(req, App.mongoDbOperations);

    res.json(response);
};

/**
 * 2)
 * HTTP-POST /NodeJS/timeEntries + '/pause' -> a timeEntries document is updated with a new IPause object in the pauses-array
 * @param req 
 * @param res 
 */
const postPauseTimeEntry = async (req: Request, res: Response) => {
    const response = await timeEntriesController.postPause(req, App.mongoDbOperations);

    res.json(response);
};

/**
 * 3)
 * HTTP-PATCH /NodeJS/timeEntries + '/pause' -> the timeEntries document will be updated via a overwriting with a 'patched' pauses-array
 * 
 * a) the current (single!) document is retrieved from the db
 * b) the endTime property is set in this object (of type IPause) -> and again written to the DB!?!
 * c) so the currently updated document is retrieved from the db (again!)
 * d) calculate the duration of the (last!?!) entry ?
 * e) overwrite the entire pauses array with a so 'patched' pauses array
 * 
 * 
 * @param req 
 * @param res 
 */
const patchPauseTimeEntry = async (req: Request, res: Response) => {
    // a)
    const filterQuery = RequestProcessingHelpers.getFilerQuery(req);
    const storedDocuments = await timeEntriesController.get(req, App.mongoDbOperations, filterQuery);

    // DEBUGGING:
    // console.error(JSON.stringify(storedDocuments, null, 4));
    // console.error('the storedDocuments');

    // b)
    const response = await timeEntriesController.patchPause(req, App.mongoDbOperations, storedDocuments);

    // // DEBUGGING:
    // console.error(JSON.stringify(response, null, 4));
    // console.error('calling doSomething');

    // c)
    const anotherTimeTheStoredDocuments = await timeEntriesController.get(req, App.mongoDbOperations, filterQuery);


    // DEBUGGING:
    // console.error(JSON.stringify(anotherTimeTheStoredDocuments, null, 4));
    // console.error('calling do something');

    // d) and e)
    const doSomethingResponse = await timeEntriesController.calculatePauseAndRewriteArrayToDocument(App.mongoDbOperations, filterQuery, anotherTimeTheStoredDocuments);

    // DEBUGGING:
    // console.error('doSomethingResponse');
    // console.error(JSON.stringify(doSomethingResponse, null, 4));

    res.json(doSomethingResponse);
};

const getDurationStr = async (req: Request, res: Response) => {
    const theId = UrlHelpers.getIdFromUlr(req.url);
    const response = await timeEntriesController.getDurationStr(theId, App.mongoDbOperations);

    res.json(response);
};

const deleteByTaskId = async (req: Request, res: Response) => {
    const theId = UrlHelpers.getIdFromUlr(req.url);

    // DEBUGGING:
    // console.error('theId:' + theId);

    try {
        const timeEntriesByTaskId: ITimeEntryDocument[] = await timeEntriesController.getTimeEntriesForTaskIds([theId], App.mongoDbOperations);

        // DEBUGGING:
        // console.error(JSON.stringify(timeEntriesByTaskId, null, 4));

        await new Promise((resolve: (value: any) => void) => {
            let theIndex = 0;
            const promiseThenLoop = () => {
                // DELETE
                // console.error(theIndex + '<' + timeEntriesByTaskId.length);

                if (theIndex < timeEntriesByTaskId.length) {
                    const theQueryObj: FilterQuery<any> = {};
                    const oneTimeEntry: ITimeEntryDocument = timeEntriesByTaskId[theIndex];
                    theQueryObj[routesConfig.timeEntryIdProperty] = oneTimeEntry.timeEntryId;

                    // patch each of this entries with isDeletedInClient = true
                    const patchPromise = timeEntriesController.patchDeletedInClient(req, App.mongoDbOperations, theQueryObj);
                    patchPromise.then(() => {
                        theIndex++;
                        promiseThenLoop();
                    });
                    patchPromise.catch(() => {
                        theIndex++;
                        promiseThenLoop();
                    });
                } else {
                    // DEBUGGING
                    // console.error('finished');
                    resolve(true);
                }
            };
            // initial call
            promiseThenLoop();
        });
        res.json(true);
    } catch (e) {
        console.error(e);
        res.json(null);
    }
};

const getDurationSumDays = async (req: Request, res: Response) => {
    const helper = new CalculateDurationsByDay();
    const getBasis = (timeEntryDoc: ITimeEntryDocument): Promise<IBookingDeclaration | ITask> => {
        return new Promise<IBookingDeclaration | ITask>((resolve: (value: IBookingDeclaration)=>void, reject: (value?: any) => void) => {
            const bookingsPromise = timeEntriesController.getBooking(timeEntryDoc._bookingDeclarationId, App.mongoDbOperations);
                  bookingsPromise.then((bookings: IBookingDeclaration[]) => {

            
            if (!bookings || bookings.length !== 1) {
                    console.error('no or more than one booking-ids found');
                    console.error(JSON.stringify(timeEntryDoc, null, 4));
                    console.error(JSON.stringify(bookings, null, 4));
                    console.error('no or more than one booking-ids found');
                    reject(null);
                    return;
                }
                const booking = bookings[0];
                resolve(booking);
            });
            bookingsPromise.catch(() => {
                reject(null);
            });
        });
    };
    const getId = (basis: IBookingDeclaration) => {
        return basis.bookingDeclarationId;
    };
    helper.calculate(req, res, getBasis, getId, routesConfig.isDeletedInClientProperty);

    // TODO: mark timeEntries as isDisabledInBooking = true
};

const getDurationSumsTasksHandler = async (req: Request, res: Response) => {
    /**
     * one entry in durationSumsTasks is for one specific day:
     * on one day several durations are possible (lines in the table in the UI).
     * So for one line (duration) the sum of (eventually several) time entries needs to be calculated.
     */
    // const durationSumsTasks: ITasksDurationSum[] = 
    // [
    //     {
    //         day: new Date,
    //         durations: []
    //     }
    // ];
    // res.json(durationSumsTasks);
    const helper = new CalculateDurationsByDay();
    const getBasis = (timeEntryDoc: ITimeEntryDocument): Promise<IBookingDeclaration | ITask> => {
        return new Promise<IBookingDeclaration | ITask>((resolve: (value: ITask)=>void, reject: (value?: any) => void) => {
            const filterQuey: FilterQuery<any> =  {};
            filterQuey[routesConfig.taskIdProperty] = timeEntryDoc._taskId;
            filterQuey[routesConfig.isDisabledProperty] = false;
            const taskPromise = taskController.get(req, App.mongoDbOperations, filterQuey);
            taskPromise.then((tasks: ITask[]) => {
                if (!tasks || tasks.length === 0) {
                    console.error('no tasks found for taskId:' + timeEntryDoc._taskId);
                    reject(null);
                    return;
                }

                resolve(tasks[0]);
            });
            taskPromise.catch(() => {
                reject(null);
            });
        });
    };
    const getId = (basis: IBookingDeclaration) => {
        return basis.bookingDeclarationId;
    };
    helper.calculate(req, res, getBasis, getId, routesConfig.isDisabledInCommit);

    // TODO: mark timeEntries as isDisabledInCommit = true
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

const durationRoute = router.route(routesConfig.timeEntriesDurationSuffix + '/*');
durationRoute.get(asyncHandler(getDurationStr));

const durationSumRoute = router.route(routesConfig.timeEntriesDurationSumSuffix);
durationSumRoute.get(asyncHandler(getDurationSumDays));

const deleteByTaskIdRoute = router.route(routesConfig.deleteTimeEntryByTaskIdSuffix + '/*');
deleteByTaskIdRoute.delete(asyncHandler(deleteByTaskId));

const getViaTaskIdRoute = router.route(routesConfig.timeEntriesViaTaskIdSuffix + '/*');
getViaTaskIdRoute.get(asyncHandler(getViaTaskId));

const getDurationSumsTasks = router.route(routesConfig.timeEntriesDurationSumTasksSuffix);
getDurationSumsTasks.get(asyncHandler(getDurationSumsTasksHandler))

export default router;
