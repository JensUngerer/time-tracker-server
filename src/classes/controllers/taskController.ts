import { MonogDbOperations} from './../helpers/mongoDbOperations';
import { Request } from 'express';
import routes from '../../../../common/typescript/routes.js';
import { ITask } from './../../../../common/typescript/iTask';
import { ITasksDocument } from './../../../../common/typescript/mongoDB/iTasksDocument';
import _ from 'lodash';
import { FilterQuery } from 'mongodb';

export default {
    post(req: Request): Promise<any> {
        const task: ITask = req.body[routes.taskBodyProperty];

        const extendedTask: ITasksDocument = _.clone(task) as ITasksDocument;
        extendedTask.isDeletedInClient = false;

        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();
        return mongoDbOperations.insertOne(extendedTask, routes.tasksCollectionName);
    },
    get(req: Request): Promise<any[]> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const filterQuery: FilterQuery<any> = {};
        filterQuery[routes.isDeletedInClientProperty] = false;
      
        return mongoDbOperations.getFiltered(routes.tasksCollectionName, filterQuery);
    },
    patch(req: Request): Promise<any>  {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();

        const propertyName = req.body[routes.httpPatchIdPropertyToUpdateName]; // 'isDeletedInClient';
        const propertyValue = req.body[routes.httpPatchIdPropertyToUpdateValue]; //true;
        const idPropertyName = req.body[routes.httpPatchIdPropertyName];
        const projectId = req.body[routes.httpPatchIdPropertyValue];

        // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
        const theQueryObj: FilterQuery<any>  = { };
        theQueryObj[idPropertyName] = projectId;

        const collectionName = routes.tasksCollectionName;
        return mongoDbOperations.patch(propertyName, propertyValue, collectionName, theQueryObj);
    }
};