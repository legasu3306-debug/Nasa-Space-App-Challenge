import { Request, Response, NextFunction } from 'express';
import { CoordinateQuerySchema } from '@fieldshift/shared';
import { fetchAllFieldShiftNasaGranules } from '../services/nasa/cmr.service.js';
import { fetchModisOrnlDates } from '../services/nasa/modis.service.js';

export async function getLiveDataSourcesStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lon } = CoordinateQuerySchema.parse({
      lat: req.query.lat ?? 8.75,
      lon: req.query.lon ?? 38.98
    });

    const [cmrGranules, modisOrnl] = await Promise.all([
      fetchAllFieldShiftNasaGranules(lat, lon),
      fetchModisOrnlDates(lat, lon)
    ]);

    res.json({
      verifiedAt: new Date().toISOString(),
      coordinates: { latitude: lat, longitude: lon },
      cmrGranules,
      modisOrnl
    });
  } catch (err) {
    next(err);
  }
}
