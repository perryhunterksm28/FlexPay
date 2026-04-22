import type { Express } from 'express';
import cors from 'cors';

export function applyCors(app: Express): void {
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
  app.use(
    cors({
      origin: corsOrigins?.length ? corsOrigins : true,
      credentials: true,
    })
  );
}
