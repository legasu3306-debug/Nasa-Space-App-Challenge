import { env } from '../../config/env.js';
import { DataProvenance } from '@fieldshift/shared';

export interface Era5HourlyPoint {
  timestamp: string;
  temp2mC: number;
  relHumidity2mPct: number;
  precipProbPct: number;
  precipMm: number;
  windSpeed10mMs: number;
  windGusts10mMs: number;
  soilTempPct: number;
}

export interface Era5ReanalysisResult {
  available: boolean;
  isExternalPartner: true;
  partner: 'ESA / ECMWF Copernicus Climate Data Store';
  errorReason?: string;
  provenance: DataProvenance;
  hourly: Era5HourlyPoint[];
  daily: {
    date: string;
    precipSumMm: number;
    tempMaxC: number;
    tempMinC: number;
  }[];
}

/**
 * ERA5 reanalysis via ECMWF Copernicus Climate Data Store.
 * Listed under Space Agency Partner Resources (ESA) in the Space Apps 2026
 * Adapting Farms challenge resources page.
 *
 * NOTE: ERA5 is reanalysis (historical ~5-day lag), not a true forecast.
 * It is the closest NASA/ESA-partner-approved alternative to Open-Meteo for
 * hourly climate variables when only Space Apps-listed resources may be used.
 * Requires CDS API key authentication (https://cds.climate.copernicus.eu).
 */
export async function fetchEra5Reanalysis(
  latitude: number,
  longitude: number,
  days = 7
): Promise<Era5ReanalysisResult> {
  const url = `${env.ERA5_CDS_API_URL || 'https://cds.climate.copernicus.eu/api/v2'}/reanalysis-era5-single-levels`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: env.ERA5_CDS_API_KEY ? `Bearer ${env.ERA5_CDS_API_KEY}` : ''
      },
      body: JSON.stringify({
        variable: ['2m_temperature', '2m_relative_humidity', 'total_precipitation', '10m_wind_speed', '10m_wind_gusts'],
        pressure_level: null,
        year: new Date().getFullYear().toString(),
        month: String(new Date().getMonth() + 1).padStart(2, '0'),
        day: Array.from({ length: days }, (_, i) => String(new Date().getDate() + i).padStart(2, '0')).filter(Boolean),
        time: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00'),
        area: [
          latitude + 0.1,
          longitude - 0.1,
          latitude - 0.1,
          longitude + 0.1
        ],
        format: 'json'
      })
    });

    if (!res.ok) {
      throw new Error(`ERA5 CDS API HTTP ${res.status}`);
    }

    const data = await res.json();

    const hourly: Era5HourlyPoint[] = (data.hourly || []).map((h: Record<string, unknown>, idx: number) => ({
      timestamp: String(h.time || ''),
      temp2mC: Number((h.t2m as number ?? 0) - 273.15),
      relHumidity2mPct: Math.round(h.r2m as number ?? 0),
      precipProbPct: Math.round((h.tp as number ?? 0) * 100),
      precipMm: Number((h.tp as number ?? 0).toFixed(2)),
      windSpeed10mMs: Number((h.ws10 as number ?? 0).toFixed(1)),
      windGusts10mMs: Number((h.wg10 as number ?? 0).toFixed(1)),
      soilTempPct: Number((h.stl1 as number ?? 0) - 273.15)
    }));

    const daily: Era5ReanalysisResult['daily'] = [];
    const byDate = new Map<string, Era5HourlyPoint[]>();
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
        tempMinC: Number(Math.min(...pts.map((p) => p.temp2mC)).toFixed(1))
      });
    }

    return {
      available: daily.length > 0,
      isExternalPartner: true,
      partner: 'ESA / ECMWF Copernicus Climate Data Store',
      provenance: {
        provider: 'ERA5 — ECMWF Reanalysis v5 (ESA Copernicus Partner Resource)',
        productIdentifier: 'ERA5_SINGLE_LEVELS_HOURLY',
        productVersion: 'v5',
        observationPeriod: `ERA5 reanalysis (approx 5-day lag)`,
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '0.25° × 0.25° (~31 km)',
        unit: '°C, %, mm, m/s',
        processingMethod: 'ECMWF IFS atmospheric reanalysis via Copernicus Climate Data Store',
        dataType: 'REANALYSIS',
        isStale: true,
        sourceUrl: 'https://cds.climate.copernicus.eu/'
      },
      hourly,
      daily
    };
  } catch (err) {
    return {
      available: false,
      isExternalPartner: true,
      partner: 'ESA / ECMWF Copernicus Climate Data Store',
      errorReason: err instanceof Error ? err.message : 'ERA5 request failed',
      provenance: {
        provider: 'ERA5 — ECMWF Reanalysis v5 (ESA Copernicus Partner Resource)',
        productIdentifier: 'ERA5_SINGLE_LEVELS_HOURLY',
        productVersion: 'v5',
        observationPeriod: 'Unavailable',
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '0.25° × 0.25°',
        unit: '°C, %, mm, m/s',
        processingMethod: 'Unavailable — CDS API request failed',
        dataType: 'REANALYSIS',
        isStale: true,
        sourceUrl: 'https://cds.climate.copernicus.eu/'
      },
      hourly: [],
      daily: []
    };
  }
}
