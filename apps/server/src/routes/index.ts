import { Router } from 'express';
import { farmRouter } from './farm.routes.js';
import { weatherRouter } from './weather.routes.js';
import { decisionRouter } from './decision.routes.js';
import { rotationRouter } from './rotation.routes.js';
import { dataSourceRouter } from './datasource.routes.js';

export const apiRouter = Router();

apiRouter.use('/farms', farmRouter);
apiRouter.use('/weather', weatherRouter);
apiRouter.use('/decisions', decisionRouter);
apiRouter.use('/rotation', rotationRouter);
apiRouter.use('/data-sources', dataSourceRouter);
