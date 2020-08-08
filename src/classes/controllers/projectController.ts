import { MonogDbOperations} from './../helpers/mongoDbOperations';
import { Request } from 'express';
import routes from '../../../../common/typescript/routes.js';
import { IProject } from './../../../../common/typescript/iProject';
import _  from 'lodash';
import { IProjectsDocument } from './../../../../common/typescript/mongoDB/iProjectsDocument';
import { FilterQuery } from 'mongodb';
import { Serialization } from './../../../../common/typescript/helpers/serialization';

export default {
    post(req: Request, mongoDbOperations: MonogDbOperations): Promise<any> {
        // DEBUGGING:
        // console.log(req.body);

        const body = Serialization.deSerialize<any>(req.body);

        // DEBUGGING:
        // console.log(JSON.stringify(body, null, 4));

        const project: IProject = body[routes.projectBodyProperty];
        
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
        const body = Serialization.deSerialize<any>(req.body);
        
        // DEBUGGING:
        console.log(JSON.stringify(body, null, 4));

        const propertyName = body[routes.httpPatchIdPropertyToUpdateName]; // 'isDeletedInClient';
        const propertyValue = body[routes.httpPatchIdPropertyToUpdateValue]; //true;
        const idPropertyName = body[routes.httpPatchIdPropertyName];
        const projectId = body[routes.httpPatchIdPropertyValue];

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