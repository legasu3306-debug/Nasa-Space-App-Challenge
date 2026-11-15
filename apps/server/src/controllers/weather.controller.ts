import { Request, Response, NextFunction } from 'express';
import { CoordinateQuerySchema } from '@fieldshift/shared';
import { fetchNasaPowerDailySeries, fetchNasaPowerClimatology } from '../services/nasa/power.service.js';
import { fetchAllFieldShiftNasaGranules } from '../services/nasa/cmr.service.js';
import { fetchModisOrnlDates } from '../services/nasa/modis.service.js';
import { fetchNldasGldas } from '../services/nasa/nldas.service.js';

export async function getCurrentWeatherBundleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lon, days } = CoordinateQuerySchema.parse(req.query);
    const end = new Date();
    const start = new Date(end.getTime() - 48 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

    const [nasaPowerDaily, nasaClimatology, cmrGranules, modisOrnl, nldasGldas] = await Promise.all([
      fetchNasaPowerDailySeries(lat, lon, fmt(start), fmt(end)),
      fetchNasaPowerClimatology(lat, lon),
      fetchAllFieldShiftNasaGranules(lat, lon),
      fetchModisOrnlDates(lat, lon),
      fetchNldasGldas(lat, lon, days)
    ]);

    res.json({
      coordinates: { latitude: lat, longitude: lon },
      nasaPowerDaily,
      nasaClimatology,
      nasaCmrGranules: cmrGranules,
      nasaModisOrnl: modisOrnl,
      nldasGldas
    });
  } catch (err) {
    next(err);
  }
}
