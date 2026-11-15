import { env } from '../../config/env.js';
import { DailyNasaObservation, DataProvenance } from '@fieldshift/shared';

const MISSING_VALUE = -990;

function cleanNum(val: number | undefined): number | null {
  if (val === undefined || val === null || Number.isNaN(val) || val <= MISSING_VALUE) {
    return null;
  }
  return Number(val.toFixed(3));
}

function ymdToIso(ymd: string): string {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

export interface NasaPowerDailyResponse {
  available: boolean;
  errorReason?: string;
  provenance: DataProvenance;
  observations: DailyNasaObservation[];
}

export interface NasaPowerClimatologyResponse {
  available: boolean;
  monthlyPrecipMmDay: Record<string, number>;
  monthlyTempMeanC: Record<string, number>;
  annualPrecipMm: number | null;
  provenance: DataProvenance;
}

export async function fetchNasaPowerDailySeries(
  latitude: number,
  longitude: number,
  startYmd: string,
  endYmd: string
): Promise<NasaPowerDailyResponse> {
  const params = [
    'PRECTOTCORR',
    'T2M',
    'T2M_MAX',
    'T2M_MIN',
    'RH2M',
    'WS2M',
    'ALLSKY_SFC_SW_DWN',
    'GWETTOP',
    'GWETROOT'
  ].join(',');

  const url = `${env.NASA_POWER_BASE_URL}/daily/point?parameters=${params}&community=AG&longitude=${longitude.toFixed(4)}&latitude=${latitude.toFixed(4)}&start=${startYmd}&end=${endYmd}&format=JSON`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.EXTERNAL_API_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`NASA POWER Daily API HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      header?: { api?: { version?: string } };
      properties?: { parameter?: Record<string, Record<string, number>> };
    };

    const param = data?.properties?.parameter;
    if (!param || !param.PRECTOTCORR) {
      throw new Error('Malformed NASA POWER response: missing PRECTOTCORR');
    }

    const dates = Object.keys(param.PRECTOTCORR).sort();
    const observations: DailyNasaObservation[] = [];

    for (const ymd of dates) {
      const pVal = cleanNum(param.PRECTOTCORR?.[ymd]);
      const tMean = cleanNum(param.T2M?.[ymd]);
      if (pVal === null && tMean === null) continue; // Filter trailing latency fill days (-999)

      observations.push({
        date: ymdToIso(ymd),
        precipMm: pVal,
        tempMeanC: tMean,
        tempMaxC: cleanNum(param.T2M_MAX?.[ymd]),
        tempMinC: cleanNum(param.T2M_MIN?.[ymd]),
        relHumidityPct: cleanNum(param.RH2M?.[ymd]),
        windSpeed2mMs: cleanNum(param.WS2M?.[ymd]),
        solarRadKwhM2: cleanNum(param.ALLSKY_SFC_SW_DWN?.[ymd]),
        surfaceSoilWetness: cleanNum(param.GWETTOP?.[ymd]),
        rootSoilWetness: cleanNum(param.GWETROOT?.[ymd])
      });
    }

    return {
      available: observations.length > 0,
      provenance: {
        provider: 'NASA Langley Research Center (LaRC) POWER',
        productIdentifier: 'NASA_POWER_AG_DAILY (MERRA-2 / GEOS-5.12.4)',
        productVersion: data?.header?.api?.version || 'v2.5.0',
        observationPeriod: `${ymdToIso(startYmd)} to ${observations[observations.length - 1]?.date || ymdToIso(endYmd)}`,
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '0.5° × 0.625° (~55 km meteorology) / 1.0° × 1.0° (solar)',
        unit: 'mm/day, °C, %, m/s, kWh/m²/day, wetness (0-1)',
        processingMethod: 'NASA GMAO MERRA-2 & GEOS satellite/gauge assimilation',
        dataType: 'REANALYSIS',
        isStale: false,
        sourceUrl: 'https://power.larc.nasa.gov/docs/'
      },
      observations
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      available: false,
      errorReason: err instanceof Error ? err.message : 'NASA POWER request failed',
      provenance: {
        provider: 'NASA Langley Research Center (LaRC) POWER',
        productIdentifier: 'NASA_POWER_AG_DAILY',
        productVersion: 'v2.5.0',
        observationPeriod: `${startYmd} to ${endYmd}`,
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '0.5° × 0.625° (~55 km)',
        unit: 'mm/day, °C, %, m/s',
        processingMethod: 'Unavailable — live request failed; never replaced with fabricated values',
        dataType: 'REANALYSIS',
        isStale: true,
        sourceUrl: 'https://power.larc.nasa.gov/docs/'
      },
      observations: []
    };
  }
}

export async function fetchNasaPowerClimatology(
  latitude: number,
  longitude: number
): Promise<NasaPowerClimatologyResponse> {
  const url = `${env.NASA_POWER_BASE_URL}/climatology/point?parameters=PRECTOTCORR,T2M&community=AG&longitude=${longitude.toFixed(4)}&latitude=${latitude.toFixed(4)}&format=JSON`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.EXTERNAL_API_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`NASA POWER Climatology HTTP ${res.status}`);

    const data = (await res.json()) as {
      properties?: { parameter?: Record<string, Record<string, number>> };
    };
    const pBlock = data?.properties?.parameter?.PRECTOTCORR || {};
    const tBlock = data?.properties?.parameter?.T2M || {};
    const annualMm = pBlock.ANN !== undefined && pBlock.ANN > 0 ? Number((pBlock.ANN * 365.25).toFixed(1)) : null;

    return {
      available: Object.keys(pBlock).length > 0,
      monthlyPrecipMmDay: pBlock,
      monthlyTempMeanC: tBlock,
      annualPrecipMm: annualMm,
      provenance: {
        provider: 'NASA Langley Research Center (LaRC) POWER Climatology',
        productIdentifier: 'NASA_POWER_AG_CLIMATOLOGY_30YR',
        productVersion: 'v2.5.0',
        observationPeriod: '30-Year Long-Term Climatological Baseline',
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '0.5° × 0.625° (~55 km)',
        unit: 'mm/day, °C',
        processingMethod: 'Multi-decadal monthly climatological mean',
        dataType: 'REANALYSIS',
        isStale: false,
        sourceUrl: 'https://power.larc.nasa.gov/docs/'
      }
    };
  } catch {
    clearTimeout(timer);
    return {
      available: false,
      monthlyPrecipMmDay: {},
      monthlyTempMeanC: {},
      annualPrecipMm: null,
      provenance: {
        provider: 'NASA Langley Research Center (LaRC) POWER Climatology',
        productIdentifier: 'NASA_POWER_AG_CLIMATOLOGY_30YR',
        productVersion: 'v2.5.0',
        observationPeriod: 'Unavailable',
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '0.5° × 0.625°',
        unit: 'mm/day, °C',
        processingMethod: 'Unavailable',
        dataType: 'REANALYSIS',
        isStale: true,
        sourceUrl: 'https://power.larc.nasa.gov/docs/'
      }
    };
  }
}
