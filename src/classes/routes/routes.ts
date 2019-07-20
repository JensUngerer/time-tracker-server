import express, { Request, Response } from 'express';
import routesConfig from './../../../../common/typescript/routes';

import timeRecordRoutes from './timeRecordRoutes';

// https://github.com/czechboy0-deprecated/Express-4x-Typescript-Sample/blob/master/routes/users.ts
// https://github.com/linnovate/mean/blob/master/server/config/express.js
const router = express.Router();

// https://github.com/linnovate/mean/blob/master/server/routes/index.route.js
router.use(routesConfig.timeRecord, timeRecordRoutes);

export default router;