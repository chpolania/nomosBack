import { ServerConfiguration } from "./infrastructure/server/server.configuration";
import { sendErrorResponse } from "./adapters/filters/error.handler";
import taxRouter from './adapters/routes/tax.router';
import authRouter from './adapters/routes/auth.router';

const server = new ServerConfiguration();
const app = server.app;
const fullApiPath = server.fullApiPath;

app.use(fullApiPath, authRouter);
app.use(fullApiPath, taxRouter);
app.use(sendErrorResponse);

export default app;
