import type { Express } from 'express';
import express from 'express';

export function applyBodyParsers(app: Express): void {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
}
