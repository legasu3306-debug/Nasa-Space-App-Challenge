import { Router } from 'express';
import {
  getFarmsHandler,
  getFarmByIdHandler,
  createFarmHandler,
  updateFarmHandler,
  deleteFarmHandler,
  createFieldHandler,
  createObservationHandler
} from '../controllers/farm.controller.js';

export const farmRouter = Router();

farmRouter.get('/', getFarmsHandler);
farmRouter.post('/', createFarmHandler);
farmRouter.get('/:id', getFarmByIdHandler);
farmRouter.patch('/:id', updateFarmHandler);
farmRouter.delete('/:id', deleteFarmHandler);
farmRouter.post('/:farmId/fields', createFieldHandler);
farmRouter.post('/observations', createObservationHandler);
