import { MonogDbOperations} from './../helpers/mongoDbOperations';
import { Request } from 'express';
import routes from '../../../../common/typescript/routes.js';
import { ITask } from './../../../../common/typescript/iTask';
import { ITasksDocument } from './../../../../common/typescript/mongoDB/iTasksDocument';
import _ from 'lodash';
import { FilterQuery } from 'mongodb';

export default {
    getViaProjectId(projectId: string, mongoDbOperations: MonogDbOperations) {
        const filterQuery: FilterQuery<any> = {};
        filterQuery[routes.projectIdPropertyAsForeignKey] = projectId;

        return mongoDbOperations.getFiltered(routes.tasksCollectionName, filterQuery);
    },
    post(req: Request, mongoDbOperations: MonogDbOperations): Promise<any> {
        const task: ITask = req.body[routes.taskBodyProperty];

        const extendedTask: ITasksDocument = _.clone(task) as ITasksDocument;
        extendedTask.isDeletedInClient = false;

        return mongoDbOperations.insertOne(extendedTask, routes.tasksCollectionName);
    },
    get(req: Request, mongoDbOperations: MonogDbOperations): Promise<any[]> {
        const filterQuery: FilterQuery<any> = {};
        filterQuery[routes.isDeletedInClientProperty] = false;
      
        return mongoDbOperations.getFiltered(routes.tasksCollectionName, filterQuery);
    },
    patch(req: Request, mongoDbOperations: MonogDbOperations): Promise<any>  {
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