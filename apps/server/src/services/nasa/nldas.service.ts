import { env } from '../../config/env.js';
import { DataProvenance } from '@fieldshift/shared';

export interface NldasHourlyPoint {
  timestamp: string;
  temp2mC: number;
  relHumidity2mPct: number;
  precipRateKgM2S: number;
  precipMm: number;
  windSpeed10mMs: number;
  soilMoisturePct: number;
  surfaceEvapWm2: number;
}

export interface NldasResult {
  available: boolean;
  errorReason?: string;
  provenance: DataProvenance;
  hourly: NldasHourlyPoint[];
  daily: {
    date: string;
    precipSumMm: number;
    tempMaxC: number;
    tempMinC: number;
    soilMoisturePct: number;
  }[];
}

/**
 * NLDAS / GLDAS (North American / Global Land Data Assimilation System)
 * Listed as a NASA resource in the Space Apps 2026 challenge resources page.
 *
 * Combines satellite and ground-based observations to generate gridded
 * datasets of temperature, precipitation, soil moisture, evapotranspiration
 * proxies, radiation, and other surface variables at sub-daily resolution.
 *
 * NOTE: Near-real-time assimilation data — not a true multi-day forecast.
 * Serves as the NASA-approved replacement for Open-Meteo where hourly
 * climate variables are needed.
 *
 * Accessed via NASA GES DISC / Earthdata Search.
 */
export async function fetchNldasGldas(
  latitude: number,
  longitude: number,
  days = 7
): Promise<NldasResult> {
  const url = `${env.NLDAS_GLDAS_BASE_URL || 'https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/'}GLDAS/GLDAS_NOAH025_3H.2.1`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(env.EXTERNAL_API_TIMEOUT_MS),
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`NASA GLDAS/NLDAS HTTP ${res.status}`);
    }

    const data = await res.json();

    const hourly: NldasHourlyPoint[] = (data.hourly || []).map((h: Record<string, unknown>, idx: number) => ({
      timestamp: String(h.time || ''),
      temp2mC: Number((h.tmp2m as number ?? 0) - 273.15),
      relHumidity2mPct: Math.round(h.rh2m as number ?? 0),
      precipRateKgM2S: Number(h.prate as number ?? 0),
      precipMm: Number((h.prate as number ?? 0) * 3600 * 3),
      windSpeed10mMs: Number((h.wind10m as number ?? 0).toFixed(1)),
      soilMoisturePct: Number((h.soilw0 as number ?? 0) * 100),
      surfaceEvapWm2: Number(h.evap as number ?? 0)
    }));

    const daily: NldasResult['daily'] = [];
    const byDate = new Map<string, NldasHourlyPoint[]>();
    for (const h of hourly) {
      const d = h.timestamp.slice(0, 10);
      const arr = byDate.get(d) || [];
      arr.push(h);
      byDate.set(d, arr);
    }
    for (const [d, pts] of byDate.entries()) {
      daily.push({
        date: d,
        precipSumMm: Number(pts.reduce((a, p) => a + p.precipMm, 0).toFixed(1)),
        tempMaxC: Number(Math.max(...pts.map((p) => p.temp2mC)).toFixed(1)),
        tempMinC: Number(Math.min(...pts.map((p) => p.temp2mC)).toFixed(1)),
        soilMoisturePct: Number((pts.reduce((a, p) => a + p.soilMoisturePct, 0) / pts.length).toFixed(1))
      });
    }

    return {
      available: daily.length > 0,
      provenance: {
        provider: 'NASA GLDAS / NLDAS Land Data Assimilation System',
        productIdentifier: 'GLDAS_NOAH025_3H_2.1',
        productVersion: '2.1',
        observationPeriod: `NASA GLDAS 3-hourly near-real-time assimilation`,
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '0.25° × 0.25° (~25 km)',
        unit: '°C, %, mm, m/s, kg/m²/s',
        processingMethod: 'NASA GSFC GES DISC — land data assimilation (satellite + ground)',
        dataType: 'OBSERVED',
        isStale: false,
        sourceUrl: 'https://disc.gsfc.nasa.gov/'
      },
      hourly,
      daily
    };
  } catch (err) {
    return {
      available: false,
      errorReason: err instanceof Error ? err.message : 'NASA GLDAS/NLDAS request failed',
      provenance: {
        provider: 'NASA GLDAS / NLDAS Land Data Assimilation System',
        productIdentifier: 'GLDAS_NOAH025_3H_2.1',
        productVersion: '2.1',
        observationPeriod: 'Unavailable',
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '0.25° × 0.25°',
        unit: '°C, %, mm, m/s',
        processingMethod: 'Unavailable — NASA GES DISC request failed',
        dataType: 'OBSERVED',
        isStale: true,
        sourceUrl: 'https://disc.gsfc.nasa.gov/'
      },
      hourly: [],
      daily: []
    };
  }
}

/**
 * Adapts NLDAS/GLDAS daily data to the shared DailyForecastPoint shape
 * used by the decision services. Fields NLDAS does not provide
 * (precipitation probability, wind gusts) default to 0.
 */
export function adaptNldasDailyToForecastPoints(nldasDaily: NldasResult['daily']): Array<{
  date: string;
  precipSumMm: number;
  precipProbMaxPct: number;
  tempMaxC: number;
  tempMinC: number;
  windSpeedMaxMs: number;
  windGustsMaxMs: number;
}> {
  return nldasDaily.map((d) => ({
    date: d.date,
    precipSumMm: d.precipSumMm,
    precipProbMaxPct: 0, // NLDAS assimilation does not produce probability-of-precipitation
    tempMaxC: d.tempMaxC,
    tempMinC: d.tempMinC,
    windSpeedMaxMs: 0,
    windGustsMaxMs: 0
  }));
}

/**
 * Adapts NLDAS/GLDAS hourly data to the shared HourlyForecastPoint shape
 * used by the threshing decision service. Wind gusts default to 0.
 */
export function adaptNldasHourlyToForecastPoints(nldasHourly: NldasResult['hourly']): Array<{
  timestamp: string;
  temp2mC: number;
  relHumidity2mPct: number;
  precipProbPct: number;
  precipMm: number;
  windSpeed10mMs: number;
  windGusts10mMs: number;
}> {
  return nldasHourly.map((h) => ({
    timestamp: h.timestamp,
    temp2mC: h.temp2mC,
    relHumidity2mPct: h.relHumidity2mPct,
    precipProbPct: 0, // NLDAS assimilation does not produce probability-of-precipitation
    precipMm: h.precipMm,
    windSpeed10mMs: h.windSpeed10mMs,
    windGusts10mMs: 0 // NLDAS does not provide wind gusts
  }));
}

