import { Request } from 'express';
import { ITimeRecordsDocument, ITimeRecordsDocumentData } from './../../../../common/typescript/mongoDB/iTimeRecordsDocument';
import routes from '../../../../common/typescript/routes';
import { MongoClient } from 'mongodb';
export default {
    /*async*/ post(req: Request): Promise<any> {

        // console.error('controller: '+ JSON.stringify(req));

        console.error('controller');
        // const parsedBody = JSON.parse(req.);
        const line: ITimeRecordsDocument = req.body[routes.timeRecordBodyProperty];
        console.error(JSON.stringify(line, null, 4));

        // https://mongodb.github.io/node-mongodb-native/
        // https://mongodb.github.io/node-mongodb-native/3.2/
        const url = 'mongodb://localhost:27017';
        const databaseName = routes.databaseName;
        const mongoClient = new MongoClient(url);

        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            mongoClient.connect((err: any) => {
                if (err) {
                    console.error(err);
                    resolve(err);
                    return;
                }
                console.log("Connected successfully to server");

                const db = mongoClient.db(databaseName);

                const collection = db.collection(routes.timeRecordsCollectionName);
                const castedDocument: ITimeRecordsDocumentData = line as ITimeRecordsDocumentData;
                collection.insertOne(castedDocument, (insertError: any, result: any) => {
                    if (insertError) {
                        resolve(insertError);
                        return;
                    }

                    // DEBUGGING:
                    console.log(JSON.stringify(result, null, 4));

                    resolve(castedDocument);
                    mongoClient.close();
                });
            });
        });
    }
}