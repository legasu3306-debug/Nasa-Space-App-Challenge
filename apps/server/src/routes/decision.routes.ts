import { Router } from 'express';
import {
  getSowingDecisionHandler,
  getHarvestingDecisionHandler,
  getThreshingDecisionHandler,
  postCropMaturityDecisionHandler
} from '../controllers/decision.controller.js';

export const decisionRouter = Router();

decisionRouter.get('/sowing', getSowingDecisionHandler);
decisionRouter.get('/harvesting', getHarvestingDecisionHandler);
decisionRouter.get('/threshing', getThreshingDecisionHandler);
decisionRouter.post('/crop-maturity', postCropMaturityDecisionHandler);
