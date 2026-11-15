import { Request, Response, NextFunction } from 'express';
import {
  SowingQuerySchema,
  CoordinateQuerySchema,
  ThreshingQuerySchema,
  CropMaturityRequestSchema
} from '@fieldshift/shared';
import { fetchNasaPowerDailySeries } from '../services/nasa/power.service.js';
import { fetchNldasGldas, adaptNldasDailyToForecastPoints, adaptNldasHourlyToForecastPoints } from '../services/nasa/nldas.service.js';
import { evaluateSowingOnsetDecision } from '../services/decisions/sowing.service.js';
import { evaluateHarvestWindowsDecision } from '../services/decisions/harvesting.service.js';
import { evaluateThreshingWindowsDecision } from '../services/decisions/threshing.service.js';
import { evaluateCropMaturityDecision } from '../services/decisions/crop-maturity.service.js';

export async function getSowingDecisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = SowingQuerySchema.parse(req.query);
    const end = new Date();
    const start = new Date(end.getTime() - 48 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

    const [nasaPower, nldas] = await Promise.all([
      fetchNasaPowerDailySeries(query.lat, query.lon, fmt(start), fmt(end)),
      fetchNldasGldas(query.lat, query.lon, 7)
    ]);

    const forecastDaily = adaptNldasDailyToForecastPoints(nldas.daily);
    const decision = evaluateSowingOnsetDecision(nasaPower.observations, forecastDaily, query);
    res.json({
      decision,
      nasaProvenance: nasaPower.provenance,
      forecastProvenance: nldas.provenance
    });
  } catch (err) {
    next(err);
  }
}

export async function getHarvestingDecisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lon } = CoordinateQuerySchema.parse(req.query);
    const end = new Date();
    const start = new Date(end.getTime() - 16 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

    const [nasaPower, nldas] = await Promise.all([
      fetchNasaPowerDailySeries(lat, lon, fmt(start), fmt(end)),
      fetchNldasGldas(lat, lon, 7)
    ]);

    const forecastDaily = adaptNldasDailyToForecastPoints(nldas.daily);
    const decision = evaluateHarvestWindowsDecision(nasaPower.observations, forecastDaily);
    res.json({
      decision,
      nasaProvenance: nasaPower.provenance,
      forecastProvenance: nldas.provenance
    });
  } catch (err) {
    next(err);
  }
}

export async function getThreshingDecisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ThreshingQuerySchema.parse(req.query);
    const nldas = await fetchNldasGldas(query.lat, query.lon, 7);
    const forecastHourly = adaptNldasHourlyToForecastPoints(nldas.hourly);
    const decision = evaluateThreshingWindowsDecision(forecastHourly, query);
    res.json({
      decision,
      forecastProvenance: nldas.provenance
    });
  } catch (err) {
    next(err);
  }
}

export async function postCropMaturityDecisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CropMaturityRequestSchema.parse(req.body);
    const nldas = await fetchNldasGldas(body.lat, body.lon, 7);
    const forecastDaily = adaptNldasDailyToForecastPoints(nldas.daily);
    const decision = evaluateCropMaturityDecision(body, forecastDaily);
    res.json({
      decision,
      forecastProvenance: nldas.provenance
    });
  } catch (err) {
    next(err);
  }
}
