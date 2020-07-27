import { MonogDbOperations} from './../helpers/mongoDbOperations';
import { Request } from 'express';
import routes from '../../../../common/typescript/routes.js';
import { IProject } from './../../../../common/typescript/iProject';
import _  from 'lodash';
import { IProjectsDocument } from './../../../../common/typescript/mongoDB/iProjectsDocument';
import { FilterQuery } from 'mongodb';

export default {
    post(req: Request, mongoDbOperations: MonogDbOperations): Promise<any> {
        const project: IProject = req.body[routes.projectBodyProperty];
        
        const extendedProject: IProjectsDocument = _.clone(project) as IProjectsDocument;
        extendedProject.isDisabled = false;
        // should not be necessary
        // delete extendedProject._id;
        // this is undefined
        // console.error(extendedProject._id);

        return mongoDbOperations.insertOne(extendedProject, routes.projectsCollectionName);
    },
    get(req: Request, mongoDbOperations: MonogDbOperations): Promise<any> {
        const filterQuery: FilterQuery<any> = {};
        filterQuery[routes.isDisabledProperty] = false;

        return mongoDbOperations.getFiltered(routes.projectsCollectionName, filterQuery);
    },
    patch(req: Request, mongoDbOperations: MonogDbOperations): Promise<any> {
        const propertyName = req.body[routes.httpPatchIdPropertyToUpdateName]; // 'isDeletedInClient';
        const propertyValue = req.body[routes.httpPatchIdPropertyToUpdateValue]; //true;
        const idPropertyName = req.body[routes.httpPatchIdPropertyName];
        const projectId = req.body[routes.httpPatchIdPropertyValue];

        // https://mongodb.github.io/node-mongodb-native/3.2/tutorials/crud/
        const theQueryObj: FilterQuery<any>  = { /*query: {}*/};
        theQueryObj[idPropertyName] = projectId;

        // DEBUGGING:
        // console.error(JSON.stringify({
        //     propertyName: propertyName,
        //     propertyValue: propertyValue,
        //     idPropertyName: idPropertyName,
        //     projectId: projectId,
        //     theQueryObj: theQueryObj
        // }, null, 4));

        return mongoDbOperations.patch(propertyName, propertyValue, routes.projectsCollectionName, theQueryObj);
    }

};