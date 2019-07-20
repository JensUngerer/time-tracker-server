import { AppManager } from './appManager';
import app from './app';
import * as routesConfig from './../../common/typescript/routes.js';

const port: number = routesConfig.port;
app.configure();
app.configureExpress();

app.configureRest();

app.listen(port);

AppManager.registerAppClosingEvent(app);