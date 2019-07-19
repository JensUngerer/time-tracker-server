import app from './app';

const port: number = 3000;
app.configure();
app.configureExpress();
app.listen(port);