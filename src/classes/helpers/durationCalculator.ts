import { ITimeEntryDocument } from "../../../../common/typescript/mongoDB/iTimeEntryDocument";
import { IPause } from "../../../../common/typescript/iPause";
import { IDuration } from "../../../../common/typescript/iDuration";
import { IDate } from "../../../../common/typescript/iDate";

export class DurationCalculator {
    public static getDayFrom(aFullDate: Date) {
        const year = aFullDate.getFullYear();
        const month = aFullDate.getMonth();
        const date = aFullDate.getDate() + 1;

        // https://stackoverflow.com/questions/3894048/what-is-the-best-way-to-initialize-a-javascript-date-to-midnight
        const dayDate = new Date(year, month, date);
        // dayDate.setHours(0, 0, 0, 0);
        dayDate.setUTCHours(0, 0, 0, 0);
        return dayDate;
    }

    public static getCurrentDateStructure(): IDate {
        const dateObject = new Date();
        const day = dateObject.getDate();
        const month = dateObject.getMonth() + 1;
        const year = dateObject.getFullYear();
        return {
            day,
            month,
            year   
        }
    }

    public static getSumDataStructureFromMilliseconds(milliseconds: number): IDuration {
        milliseconds = Math.floor(milliseconds / 1000);
        const seconds = milliseconds % 60;
        milliseconds = Math.floor(milliseconds / 60);
        const minutes = milliseconds % 60;
        milliseconds = Math.floor(milliseconds / 60);
        const hours = milliseconds % 60;

        return {
            hours,
            minutes,
            seconds
        };
    }

    public static calculateTimeDifferenceWithoutPauses(timeEntry: ITimeEntryDocument): number {
        let pausesDuration = 0;
        timeEntry.pauses.forEach((onePause: IPause) => {
            if (onePause.startTime && onePause.endTime) {
                pausesDuration += DurationCalculator.getTimeDifferenceInMilliseconds(onePause.endTime, onePause.startTime);
                return;
            }
            if (onePause.startTime && !onePause.endTime) {
                console.error('one pause has no endTime to startTime:' + onePause.startTime);
                pausesDuration += DurationCalculator.getTimeDifferenceInMilliseconds(new Date(), onePause.startTime);
                return;
            }
            console.error('pause has neither startTime nor endTime');
        });
        let trackedDurationInMilliseconds = 0;
        if (timeEntry.endTime && timeEntry.startTime) {
            trackedDurationInMilliseconds = DurationCalculator.getTimeDifferenceInMilliseconds(timeEntry.endTime, timeEntry.startTime);
        } else {
            if (!timeEntry.endTime && timeEntry.startTime) {
                trackedDurationInMilliseconds = DurationCalculator.getTimeDifferenceInMilliseconds(new Date(), timeEntry.startTime);
            }
        }
        if (trackedDurationInMilliseconds === 0) {
            console.error('neither endTime nor startTime');
        }

        trackedDurationInMilliseconds = trackedDurationInMilliseconds - pausesDuration;

        return trackedDurationInMilliseconds;
    }
    public static calculateDuration(doc: ITimeEntryDocument): string {
        let milliseconds = DurationCalculator.calculateTimeDifferenceWithoutPauses(doc);
        
        // DEBUGGING:
        // console.error('milliseconds:' + milliseconds / 1000);
        
        // milliseconds = Math.floor(milliseconds / 1000);
        // const seconds = milliseconds % 60;
        // milliseconds = Math.floor(milliseconds / 60);
        // const minutes = milliseconds % 60;
        // milliseconds = Math.floor(milliseconds / 60);
        // const hours = milliseconds % 60;
        const duration = DurationCalculator.getSumDataStructureFromMilliseconds(milliseconds);
        return DurationCalculator.getFullDurationStr(duration.hours, duration.minutes, duration.seconds);
    }

    public static ensureTwoDigits(aNumber: number): string {
        if (aNumber <= 9) {
            return '0' + aNumber;
        }
        return aNumber.toString();
    }

    public static getDurationStr(hours: number, minutes: number): string {
        return DurationCalculator.ensureTwoDigits(hours) + ':' + DurationCalculator.ensureTwoDigits(minutes);
    }

    public static getFullDurationStr(hours: number, minutes: number, seconds: number) {
        return DurationCalculator.getDurationStr(hours, minutes) + ':' + DurationCalculator.ensureTwoDigits(seconds);
    }

    public static getTimeDifferenceInMilliseconds(endTime: Date, startTime: Date): number {
        const theDuration = endTime.getTime() - startTime.getTime();
        return theDuration;
    }
}