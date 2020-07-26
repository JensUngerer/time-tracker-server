import { Request, Response } from "express";
import { ITimeEntryDocument } from "../../../../common/typescript/mongoDB/iTimeEntryDocument";
import timeEntriesController from "././../controllers/timeEntriesController";
import { App } from "../../app";
import { IDurationSumBase } from "../../../../common/typescript/iDurationSumBase";
import { IBookingDeclaration } from "../../../../common/typescript/iBookingDeclaration";
import { ITask } from "../../../../common/typescript/iTask";

export class CalculateDurationsByDay {

    constructor() {}

    async calculate(req: Request, res: Response, getBasis: (timeEntryDoc: ITimeEntryDocument) => Promise<IBookingDeclaration | ITask>, getId: (basis: IBookingDeclaration | ITask) => string/*, addCurrentEntry: (groupedTimeEntriesMap: { [key: number]: IDurationSumBase }, indexInDurationsArray: number, dayTimeStamp: number, oneTimeEntryDoc: ITimeEntryDocument) => void*/) {
        const addCurrentEntry = (groupedTimeEntriesMap: { [key: number]: IDurationSumBase }, indexInDurationsArray: number, dayTimeStamp: number, oneTimeEntryDoc: ITimeEntryDocument) => {
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
            const groupedTimeEntriesMap: { [key: number]: IDurationSumBase } = {};
            const lastIndexInDurationMap: { [dayTimeStamp: number]: { [id: string]: number } } = {};

            let indexInTimeEntries = 0;
            const loop = async () => {
                if (indexInTimeEntries >= timeEntryDocs.length) {
                    // convert data structure
                    const convertedDataStructure: IDurationSumBase[] = [];

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

                const day = oneTimeEntryDoc.day
                const dayTimeStamp = day.getTime();
                if (!groupedTimeEntriesMap[dayTimeStamp]) {
                    groupedTimeEntriesMap[dayTimeStamp] =
                    {
                        day,
                        durations: []
                    }
                        ;
                    // DEBUGGING:
                    // console.log('created empty entry for dayTimeStamp:' + dayTimeStamp)
                }
                if (typeof lastIndexInDurationMap[dayTimeStamp] === 'undefined') {
                    lastIndexInDurationMap[dayTimeStamp] = {};
                }

                try {
                    const basis = await getBasis(oneTimeEntryDoc);
                    const id = getId(basis);

                    if (typeof lastIndexInDurationMap[dayTimeStamp][id] === 'undefined') {
                        groupedTimeEntriesMap[dayTimeStamp].durations.push(
                            {
                                basis,
                                durationInHours: 0,
                                durationSumInMilliseconds: 0,
                                _timeEntryIds: []
                            }
                        );
                        lastIndexInDurationMap[dayTimeStamp][id] = groupedTimeEntriesMap[dayTimeStamp].durations.length - 1;
                        // DEBUGGING
                        // console.log('created empty entry for _bookingDeclarationId:' + oneTimeEntryDoc._bookingDeclarationId);
                    }
                    const indexInDurationsArray = lastIndexInDurationMap[dayTimeStamp][id];
    
                    //     // DEBUGGING:
                    //     // console.log(JSON.stringify(lastIndexInDurationMap, null, 4));
    
                    addCurrentEntry(groupedTimeEntriesMap, indexInDurationsArray, dayTimeStamp, oneTimeEntryDoc);
    
                    indexInTimeEntries++;
                    loop();
                
                } catch (eBasis) {
                    console.error(eBasis);

                    indexInTimeEntries++;
                    loop();
                }
            };
            // initial call
            loop();

        } catch (e) {
            console.error(e);
        }
    }
}