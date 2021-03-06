import { MonogDbOperations} from './../helpers/mongoDbOperations';
import { Request } from 'express';
import routes from '../../../../common/typescript/routes.js';
import { ITask } from './../../../../common/typescript/iTask';
import { ITasksDocument } from './../../../../common/typescript/mongoDB/iTasksDocument';
import _ from 'lodash';
import { FilterQuery } from 'mongodb';
import { Serialization } from '../../../../common/typescript/helpers/serialization';

export default {
    getViaProjectId(projectId: string, mongoDbOperations: MonogDbOperations) {
        const filterQuery: FilterQuery<any> = {};
        filterQuery[routes.projectIdPropertyAsForeignKey] = projectId;
        filterQuery[routes.isDisabledProperty] = false;

        return mongoDbOperations.getFiltered(routes.tasksCollectionName, filterQuery);
    },
    post(req: Request, mongoDbOperations: MonogDbOperations): Promise<any> {
        const body = Serialization.deSerialize<any>(req.body);

        const task: ITask = body[routes.taskBodyProperty];

        const extendedTask: ITasksDocument = _.clone(task) as ITasksDocument;
        extendedTask.isDisabled = false;

        return mongoDbOperations.insertOne(extendedTask, routes.tasksCollectionName);
    },
    get(req: Request, mongoDbOperations: MonogDbOperations, filterQuery?: FilterQuery<any>): Promise<any[]> {
        if (!filterQuery) {
            const defaultFilterQuery: FilterQuery<any> = {};
            defaultFilterQuery[routes.isDisabledProperty] = false;
            return mongoDbOperations.getFiltered(routes.tasksCollectionName, defaultFilterQuery);
        }
        return mongoDbOperations.getFiltered(routes.tasksCollectionName, filterQuery);
    },
    patch(req: Request, mongoDbOperations: MonogDbOperations): Promise<any>  {
        const body = Serialization.deSerialize<any>(req.body);

        const propertyName = body[routes.httpPatchIdPropertyToUpdateName]; // 'isDeletedInClient';
        const propertyValue = body[routes.httpPatchIdPropertyToUpdateValue]; //true;
        const idPropertyName = body[routes.httpPatchIdPropertyName];
        const projectId = body[routes.httpPatchIdPropertyValue];

        // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
        const theQueryObj: FilterQuery<any>  = { };
        theQueryObj[idPropertyName] = projectId;

        const collectionName = routes.tasksCollectionName;
        return mongoDbOperations.patch(propertyName, propertyValue, collectionName, theQueryObj);
    }
};