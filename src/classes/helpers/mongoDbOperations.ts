import { MongoClient, Cursor } from 'mongodb';
import * as routes from '../../../../common/typescript/routes.js';

export class MonogDbOperations {
    private mongoClient: MongoClient = null;
    private databaseName: string = null;
    private url: string = null;

    public prepareConnection() {
        this.url = routes.url;
        this.databaseName = routes.databaseName;

        this.mongoClient = new MongoClient(this.url, { useNewUrlParser: true });
    }

    public getAll(collectionName: string): Promise<any[]> {
        return new Promise<any>((resolve: (value: any[]) => void, reject: (value: any) => void) => {
            this.mongoClient.connect((err: any) => {
                if (err) {
                    console.error(err);
                    resolve(err);
                    return;
                }
                const db = this.mongoClient.db(this.databaseName);
    
                const collection = db.collection(collectionName);
                
                const cursor: Cursor<any> = collection.find({});
                if (!cursor) {
                    console.error('!cursor');
                    resolve([]);
                    this.mongoClient.close();
                    return;
                }

                cursor.toArray().then((resolvedData: any[])=>{
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
                delete data._id;
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