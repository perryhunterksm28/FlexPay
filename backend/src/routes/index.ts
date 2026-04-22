import type { Express } from 'express';
import apiRoutes from './api.routes';
import healthRoutes from './health.routes';

export function registerRoutes(app: Express): void {
  app.use(healthRoutes);
  app.use('/api', apiRoutes);
}
