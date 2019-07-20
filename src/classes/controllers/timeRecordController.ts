import { Request } from 'express';

export default {
    /*async*/ post(req: Request): Promise<any> {

        // console.error('controller: '+ JSON.stringify(req));

        console.error('controller');
        return Promise.resolve(req.body);
    }
}