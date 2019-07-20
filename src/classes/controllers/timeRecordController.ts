import { Request } from 'express';
import { IGridCommitLine } from './../../../../common/typescript/iGridCommitLine';

export default {
    /*async*/ post(req: Request): Promise<any> {

        // console.error('controller: '+ JSON.stringify(req));

        console.error('controller');
        // const parsedBody = JSON.parse(req.);
        const line: IGridCommitLine = req.body.line;
        console.error(JSON.stringify(line, null, 4));

        return Promise.resolve(req.body);
    }
}