import { TimeManagement } from './timeManagement';
import { MongoClient, Cursor, FilterQuery } from 'mongodb';
import * as routes from '../../../../common/typescript/routes.js';
import { ITimeEntryDocument } from '../../../../common/typescript/mongoDB/iTimeEntryDocument.js';
import { IPause } from '../../../../common/typescript/iPause';

export class MonogDbOperations {
    private mongoClient: MongoClient = null;
    private databaseName: string = null;
    private url: string = null;

    public prepareConnection() {
        this.url = routes.url;
        this.databaseName = routes.databaseName;

        this.mongoClient = new MongoClient(this.url, { useNewUrlParser: true });
    }

    public patchPush(propertyName: string, propertyValue: any, collectionName: string, queryObj: FilterQuery<any>) {
        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            this.mongoClient.connect((err: any) => {
                if (err) {
                    console.error(err);
                    resolve(err);
                    return;
                }

                const db = this.mongoClient.db(this.databaseName);

                const collection = db.collection(collectionName);

                const updateObj: any = { $push: {} };
                updateObj.$push[propertyName] = propertyValue;

                // // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/

                // // DEBUGGING:
                // console.error(JSON.stringify({
                //     queryObj,
                //     updateObj
                // }, null, 4));

                collection.updateOne(queryObj, updateObj, (err: any, result: any) => {
                    if (err) {
                        console.error('update failed');
                        resolve(err);
                        return;
                    }

                    this.mongoClient.close();
                    resolve(result);
                });
            });
        });
    }

    public patchLastTimeEntryPause(queryObj: FilterQuery<any>, storedDocuments: any[]) {
        const collectionName: string = routes.timEntriesCollectionName;
        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            this.mongoClient.connect((err: any) => {
                if (err) {
                    console.error(err);
                    resolve(err);
                    return;
                }

                const db = this.mongoClient.db(this.databaseName);

                // const storedDocumentPromise: Promise<any[]> = this.getFiltered(collectionName, queryObj);
                // storedDocumentPromise.then((resolveDoc: any[]) => {
                if (!storedDocuments || storedDocuments.length === 0) {
                    console.error('no document found which could be patched');
                    resolve('error');
                    return;
                }
                const singleDoc = storedDocuments[0] as ITimeEntryDocument;
                const pausesArray = singleDoc.pauses;
                if (!pausesArray || pausesArray.length === 0) {
                    console.error('cannot use pauses array');
                    resolve('errorTwo');
                    return;
                }

                const currentPauseObject = pausesArray[pausesArray.length - 1];
                currentPauseObject.endTime = new Date();

                // overwrite the entire pausesArray

                const collection = db.collection(collectionName);

                const propertyName = routes.pausesProperty;
                // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
                const updateObj: any = { $set: {} };
                updateObj.$set[propertyName] = pausesArray;

                // DEBUGGING:
                // console.error(JSON.stringify({
                //     queryObj,
                //     updateObj
                // }, null, 4));

                collection.updateOne(queryObj, updateObj, (err: any, result: any) => {
                    if (err) {
                        console.error('update failed');
                        resolve(err);
                        return;
                    }

                    this.mongoClient.close();

                    resolve(result);
                    // storeDurationsInPausesPromise.then(resolve);
                    // storeDurationsInPausesPromise.catch(reject);
                });
            });
        });

        // });
    }

    public storeDurationInPausesOfDocument(queryObj: FilterQuery<any>, documents: ITimeEntryDocument[]): Promise<any> {
        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            // const promise = this.getFiltered(routes.timEntriesCollectionName, queryObj);
            // promise.then((documents: ITimeEntryDocument[]) => {
            if (!documents || documents.length === 0 || documents.length > 1) {
                console.error('the documents are empty');
                resolve('the documents are empty');
                return;
            }
            const theSingleDoc = documents[0];
            // let loopCtr = 0;
            const thePauses = theSingleDoc.pauses;

            for (let loopCtr = 0; loopCtr < thePauses.length; loopCtr++) {
                const onePause = thePauses[loopCtr];
                onePause.duration = TimeManagement.pauseEntryToDuration(onePause);
            }

            // write the entire array back to the document
            const patchArrayPromise = this.patchDurationsArrayInTimeEntry(thePauses, queryObj);
            patchArrayPromise.then(resolve);
            patchArrayPromise.catch(reject);
        });
        // });
    }

    private patchDurationsArrayInTimeEntry(pauses: IPause[], queryObj: FilterQuery<any>) {
        const propertyName = routes.pausesProperty;
        const propValue = pauses;
        const collectionName = routes.timEntriesCollectionName;

        return this.patch(propertyName, propValue, collectionName, queryObj);
    }

    public patch(propertyName: string, propertyValue: any, collectionName: string, queryObj: FilterQuery<any>) {
        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            this.mongoClient.connect((err: any) => {
                if (err) {
                    console.error(err);
                    resolve(err);
                    return;
                }

                const db = this.mongoClient.db(this.databaseName);

                const collection = db.collection(collectionName);

                // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
                const updateObj: any = { $set: {} };
                updateObj.$set[propertyName] = propertyValue;

                // DEBUGGING:
                console.error('calling updateOne');
                console.error(JSON.stringify({
                    queryObj,
                    updateObj
                }, null, 4));

                collection.updateOne(queryObj, updateObj, (err: any, result: any) => {
                    if (err) {
                        console.error('update failed');
                        resolve(err);
                        return;
                    }

                    this.mongoClient.close();
                    resolve(result);
                });
            });
        });
    }

    public getFiltered(collectionName: string, queryObj?: FilterQuery<any>): Promise<any[]> {
        return new Promise<any>((resolve: (value: any[]) => void, reject: (value: any) => void) => {
            this.mongoClient.connect((err: any) => {
                if (err) {
                    console.error(err);
                    resolve(err);
                    return;
                }
                const db = this.mongoClient.db(this.databaseName);

                const collection = db.collection(collectionName);

                const retrievedFilterQuery = queryObj ? queryObj : {};

                // DEBUGGING:
                // console.error(JSON.stringify({
                //     collectionName,
                //     retrievedFilterQuery
                // }, null, 4));

                const cursor: Cursor<any> = collection.find(retrievedFilterQuery);
                if (!cursor) {
                    console.error('!cursor');
                    resolve([]);
                    this.mongoClient.close();
                    return;
                }

                cursor.toArray().then((resolvedData: any[]) => {
                    // DEBUGGING:
                    // console.error(JSON.stringify(resolvedData, null, 4));

                    resolve(resolvedData);
                    this.mongoClient.close();
                }).catch(() => {
                    resolve([]);
                    this.mongoClient.close();
                });
            });
        });
    }

    public insertOne(data: any, collectionName: string) {
        // https://mongodb.github.io/node-mongodb-native/
        // https://mongodb.github.io/node-mongodb-native/3.2/

        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            this.mongoClient.connect((err: any) => {
                if (err) {
                    console.error(err);
                    resolve(err);
                    return;
                }

                const db = this.mongoClient.db(this.databaseName);

                const collection = db.collection(collectionName);

                // should no longer be necessary as data _should_ not contain _id
                if (data && data._id) {
                    console.error('there is already an id -> returning');
                    return;
                }

                collection.insertOne(data, (insertError: any, result: any) => {
                    if (insertError) {
                        resolve(insertError);
                        return;
                    }

                    // DEBUGGING:
                    // console.log(JSON.stringify(result, null, 4));

                    resolve(data);
                    this.mongoClient.close();
                });
            });
        });
    }
}