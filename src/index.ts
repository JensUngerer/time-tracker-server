import { AppManager } from './appManager';
import app from './app';

const port: number = 3000;
app.configure();
app.configureExpress();

app.configureRest();

app.listen(port);

AppManager.registerAppClosingEvent(app);