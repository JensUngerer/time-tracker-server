import { AppManager } from './appManager';
import app from './app';
import routesConfig from './../../common/typescript/routes';

const port: number = routesConfig.port;
app.configure();
app.configureExpress();

app.configureRest();

app.listen(port);

AppManager.registerAppClosingEvent(app);