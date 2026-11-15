import { Request, Response, NextFunction } from 'express';
import {
  CreateFarmSchema,
  UpdateFarmSchema,
  CreateFieldSchema,
  CreateFieldObservationSchema
} from '@fieldshift/shared';
import * as farmService from '../services/farm.service.js';

export async function getFarmsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const farms = await farmService.listAllFarms();
    res.json({ farms });
  } catch (err) {
    next(err);
  }
}

export async function getFarmByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const farm = await farmService.getFarmById(req.params.id);
    if (!farm) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Farm not found' });
      return;
    }
    res.json({ farm });
  } catch (err) {
    next(err);
  }
}

export async function createFarmHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateFarmSchema.parse(req.body);
    const farm = await farmService.createFarmRecord(parsed);
    res.status(201).json({ farm });
  } catch (err) {
    next(err);
  }
}

export async function updateFarmHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdateFarmSchema.parse(req.body);
    const farm = await farmService.updateFarmRecord(req.params.id, parsed);
    res.json({ farm });
  } catch (err) {
    next(err);
  }
}

export async function deleteFarmHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await farmService.deleteFarmRecord(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createFieldHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateFieldSchema.parse({ ...req.body, farmId: req.params.farmId });
    const field = await farmService.createFieldRecord(parsed);
    res.status(201).json({ field });
  } catch (err) {
    next(err);
  }
}

export async function createObservationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateFieldObservationSchema.parse(req.body);
    const observation = await farmService.recordFieldObservation(parsed);
    res.status(201).json({ observation });
  } catch (err) {
    next(err);
  }
}
