import { createServer } from 'node:http';
import express from 'express';
import { registerRoutes } from './routes/index';
import { applyBodyParsers, applyCors, errorHandler, notFoundHandler } from './middleware/index';
import { loadAppEnv } from './utils/env';
import { registerWebSocket } from './websocket/index';
import { registerWorkers } from './workers/index';

loadAppEnv();
registerWorkers();

const app = express();
const port = Number.parseInt(process.env.BACKEND_PORT || '4000', 10);

applyCors(app);
applyBodyParsers(app);

registerRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = createServer(app);
registerWebSocket(app, httpServer);

httpServer.listen(port, () => {
  console.log(`Flexpay API backend listening on http://localhost:${port}`);
  console.log('Same routes as Next.js /app/api/* — set CORS_ORIGIN for allowed web origins.');
});
