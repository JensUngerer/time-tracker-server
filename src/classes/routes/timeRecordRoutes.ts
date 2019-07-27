import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import timeRecordController from '../controllers/timeRecordController'; // cont
import { App } from '../../app';

// https://github.com/linnovate/mean/blob/master/server/routes/user.route.js

const router = express.Router();

const postTimeRecord = async (req: Request, res: Response) => {
    const timeRecordPostResponse = await timeRecordController.post(req, App.mongoDbOperations);
        
    res.json(timeRecordPostResponse);
};

router.route('/').post(asyncHandler(postTimeRecord))

export default router;
