import { Request, Response, NextFunction } from 'express';
import { RotationAnalyzeRequestSchema } from '@fieldshift/shared';
import { fetchNasaPowerClimatology } from '../services/nasa/power.service.js';
import { DOCUMENTED_CROPS, analyzeCropRotationScenarios } from '../services/rotation/rotation.service.js';

export function getCropsCatalogueHandler(_req: Request, res: Response) {
  res.json({ crops: DOCUMENTED_CROPS });
}

export async function postAnalyzeRotationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = RotationAnalyzeRequestSchema.parse(req.body);
    const climatology = await fetchNasaPowerClimatology(parsed.latitude, parsed.longitude);
    const result = analyzeCropRotationScenarios(parsed, climatology.annualPrecipMm);
    res.json({
      ...result,
      climatologyProvenance: climatology.provenance
    });
  } catch (err) {
    next(err);
  }
}
