import { MonogDbOperations} from './../helpers/mongoDbOperations';
import { Request } from 'express';
import routes from '../../../../common/typescript/routes.js';
import { ITask } from './../../../../common/typescript/iTask';

export default {
    post(req: Request): Promise<any> {
        const task: ITask = req.body[routes.taskBodyProperty];
        
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();
        return mongoDbOperations.insertOne(task, routes.tasksCollectionName);
    },
    get(req: Request): Promise<any[]> {
        const mongoDbOperations: MonogDbOperations = new MonogDbOperations();
        mongoDbOperations.prepareConnection();
      
        return mongoDbOperations.getAll(routes.tasksCollectionName);
    }
};