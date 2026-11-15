import { Router } from 'express';
import { getCropsCatalogueHandler, postAnalyzeRotationHandler } from '../controllers/rotation.controller.js';

export const rotationRouter = Router();

rotationRouter.get('/crops', getCropsCatalogueHandler);
rotationRouter.post('/analyze', postAnalyzeRotationHandler);
