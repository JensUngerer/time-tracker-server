import { MongoClient } from 'mongodb';
import * as routes from '../../../../common/typescript/routes.js';

export class MonogDbOperations {
    private mongoClient: MongoClient = null;
    private databaseName: string = null;
    private url: string = null;

    public prepareConnection() {
        this.url = routes.url;
        this.databaseName = routes.databaseName;

        this.mongoClient = new MongoClient(this.url);
    }
    
    public insertOne(data: any) {        
        // https://mongodb.github.io/node-mongodb-native/
        // https://mongodb.github.io/node-mongodb-native/3.2/

        return new Promise<any>((resolve: (value: any) => void, reject: (value: any) => void) => {
            this.mongoClient.connect((err: any) => {
                if (err) {
                    console.error(err);
                    resolve(err);
                    return;
                }
                console.log("Connected successfully to server");
    
                const db = this.mongoClient.db(this.databaseName);
    
                const collection = db.collection(routes.timeRecordsCollectionName);
                delete data._id;
                collection.insertOne(data, (insertError: any, result: any) => {
                    if (insertError) {
                        resolve(insertError);
                        return;
                    }
    
                    // DEBUGGING:
                    console.log(JSON.stringify(result, null, 4));
    
                    resolve(data);
                    this.mongoClient.close();
                });
            });   
        });   
    }
}