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
    const addCurrentEntry = (groupedTimeEntriesMap: { [key: number]: IDurationSum }, indexInDurationsArray: number, dayTimeStamp: number, oneTimeEntryDoc: ITimeEntryDocument) => {
        const previousDurationSumInMilliseconds = groupedTimeEntriesMap[dayTimeStamp].durations[indexInDurationsArray].durationSumInMilliseconds;
        const currentDurationSumInMilliseconds = oneTimeEntryDoc.endTime.getTime() - oneTimeEntryDoc.startTime.getTime();
        const newDurationSumInMilliseconds = previousDurationSumInMilliseconds + currentDurationSumInMilliseconds;
        let newDurationSumInHours = Math.floor((newDurationSumInMilliseconds / (1000 * 60))) / 60;
        newDurationSumInHours = Math.round(newDurationSumInHours * 100) / 100;

        groupedTimeEntriesMap[dayTimeStamp].durations[indexInDurationsArray].durationInHours = newDurationSumInHours;
        groupedTimeEntriesMap[dayTimeStamp].durations[indexInDurationsArray].durationSumInMilliseconds = newDurationSumInMilliseconds;
        groupedTimeEntriesMap[dayTimeStamp].durations[indexInDurationsArray]._timeEntryIds.push(oneTimeEntryDoc.timeEntryId);
        // DEBUGGING:
        // console.log('adding value: ' + currentDurationSumInMilliseconds);
    };

    try {
        const timeEntryDocs: ITimeEntryDocument[] = await timeEntriesController.getDurationSumDays(req, App.mongoDbOperations);
        const groupedTimeEntriesMap: { [key: number]: IDurationSum } = {};
        const lastIndexInDurationMap: { [dayTimeStamp: number]: {[bookingDeclarationId: string]: number }} = {};

        let indexInTimeEntries = 0;
        const loop = () => {
            if (indexInTimeEntries >= timeEntryDocs.length) {
                // convert data structure
                const convertedDataStructure: IDurationSum[] = [];

                // DEBUGGING:
                // console.log(JSON.stringify(groupedTimeEntriesMap, null, 4));

                for (const key in groupedTimeEntriesMap) {
                    const value = groupedTimeEntriesMap[key];
                    convertedDataStructure.push(value);
                }

                res.json(convertedDataStructure);
                return;
            }
            const oneTimeEntryDoc: ITimeEntryDocument = timeEntryDocs[indexInTimeEntries];

            const bookingsPromise = timeEntriesController.getBooking(oneTimeEntryDoc._bookingDeclarationId, App.mongoDbOperations);
            bookingsPromise.then((bookings: IBookingDeclaration[]) => {
                // DEbUGGING:
                // console.log(JSON.stringify(bookings, null, 4));

                if (!bookings || bookings.length !== 1) {
                    console.error('no or more than one booking-ids found');
                    console.error(JSON.stringify(oneTimeEntryDoc, null, 4));
                    console.error(JSON.stringify(bookings, null, 4));
                    console.error('no or more than one booking-ids found');
                    res.json(null);
                    return;
                }
                const booking = bookings[0];
                const day = oneTimeEntryDoc.day
                const dayTimeStamp = day.getTime();
                if (!groupedTimeEntriesMap[dayTimeStamp]) {
                    groupedTimeEntriesMap[dayTimeStamp] =
                    {
                        day,
                        durations: []                    }
                        ;
                    // DEBUGGING:
                    // console.log('created empty entry for dayTimeStamp:' + dayTimeStamp)
                }
                if (typeof lastIndexInDurationMap[dayTimeStamp] === 'undefined') {
                    lastIndexInDurationMap[dayTimeStamp] = {};
                }


                if (typeof lastIndexInDurationMap[dayTimeStamp][oneTimeEntryDoc._bookingDeclarationId] === 'undefined') {
                    groupedTimeEntriesMap[dayTimeStamp].durations.push(
                        {
                            booking,
                            durationInHours: 0,
                            durationSumInMilliseconds: 0,
                            _timeEntryIds: []
                        }
                    );
                    lastIndexInDurationMap[dayTimeStamp][oneTimeEntryDoc._bookingDeclarationId] = groupedTimeEntriesMap[dayTimeStamp].durations.length - 1;
                    // DEBUGGING
                    // console.log('created empty entry for _bookingDeclarationId:' + oneTimeEntryDoc._bookingDeclarationId);
                }
                const indexInDurationsArray = lastIndexInDurationMap[dayTimeStamp][oneTimeEntryDoc._bookingDeclarationId];

                // DEBUGING:
                // console.log(JSON.stringify(lastIndexInDurationMap, null, 4));

                addCurrentEntry(groupedTimeEntriesMap, indexInDurationsArray, dayTimeStamp, oneTimeEntryDoc);

                indexInTimeEntries++;
                loop();
            });
            bookingsPromise.catch(() => {
                console.error('exception when getting booking information');

                indexInTimeEntries++;
                loop();
            });


        };
        // initial call
        loop();

    } catch (e) {
        console.error(e);
    }
};

const getDurationSumsTasksHandler = async (req: Request, res: Response) => {
    const durationSumsTasks: ITasksDurationSum[] = 
    [
        {
            day: new Date,
            durations: []
        }
    ];

    res.json(durationSumsTasks);
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
