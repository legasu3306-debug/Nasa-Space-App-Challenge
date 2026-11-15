import { Router } from 'express';
import { getLiveDataSourcesStatusHandler } from '../controllers/datasource.controller.js';

export const dataSourceRouter = Router();

dataSourceRouter.get('/status', getLiveDataSourcesStatusHandler);
