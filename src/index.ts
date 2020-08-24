// const EventLogger = require('node-windows').EventLogger;
// const programPath = require('./../programPath.js');
// const programName = require('./../programName.js');
// let eventLogger: any = null;
// // let svc = null;
// if (EventLogger) {
//     eventLogger = new EventLogger('Time-Tracker-Event-Logger');
//     eventLogger.info(programName);
//     eventLogger.info(programPath);
// }
// const Service = require('node-windows').Service;
// if (Service) {
//     svc = new Service({
//         name: programName,
//         script: programPath,
//         stopparentfirst: true
//     });
// }

import { AppManager } from './appManager';
import App from './app';
import * as routesConfig from './../../common/typescript/routes.js';

const port: number = routesConfig.port;
const hostname = routesConfig.hostname;

try {
    // if (eventLogger) {
    //     eventLogger.info('starting at:' + hostname + ':' + port);
    // }
    
    const app = new App(port, hostname);

    app.configure();
    app.configureExpress();
    app.configureRest();

    app.setupDatabaseConnection();

    AppManager.registerAppClosingEvent(app, true);

    // if (svc) {
    //     svc.on('stop', () => {
    //         if (!eventLogger) {
    //             console.error('stopping windows service');
    //         }
    //         if (eventLogger) {
    //             eventLogger.info('stopping windows service');
    //         }
    //         const dbDisconnectPromise = AppManager.gracefulShutdown('shutdown by node-windows logic', false);
    //         dbDisconnectPromise.then(() => {
    //             if (eventLogger) {
    //                 eventLogger.info('graceful-shutdown-performed: with db shutdown resolved');
    //             }
    //         });
    //         dbDisconnectPromise.then(() => {
    //             if (eventLogger) {
    //                 eventLogger.info('graceful-shutdown-performed: with db shutdown rejected');
    //             }
    //         });
    //     });
    // } else {
    //     eventLogger.info('there is no svc!!!');
    // }
} catch (e) {
    // if (!eventLogger) {
        console.error(JSON.stringify(e, null, 4));
    // } else {
    //     eventLogger.error(JSON.stringify(e, null, 4));
    // }
}
