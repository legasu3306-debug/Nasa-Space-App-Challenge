import type {
  DailyNasaObservation,
  DailyForecastPoint,
  HourlyForecastPoint,
  NasaCmrGranule,
  RotationAnalyzeRequest
} from '@fieldshift/shared';
import type { FarmProfileRecord } from './offlineDb.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface LiveTelemetryBundle {
  nasaAvailable: boolean;
  forecastAvailable: boolean;
  cmrAvailable: boolean;
  retrievedAt: string;
  observations: DailyNasaObservation[];
  climatologyAnnualRainMm: number | null;
  cmrGranulesByProduct: Record<string, NasaCmrGranule[]>;
  forecastDaily: DailyForecastPoint[];
  forecastHourly: HourlyForecastPoint[];
}

function cleanNasaVal(v: number | undefined): number | null {
  if (v === undefined || v === null || Number.isNaN(v) || v <= -990) return null;
  return Number(v.toFixed(2));
}

function formatYmd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Primary typed API client. Queries the Express backend `/api/weather/current` first,
 * and falls back seamlessly to direct CORS-enabled NASA POWER, NASA CMR Granule Search,
 * and NASA GLDAS/NLDAS HTTPS endpoints when running in serverless/static preview mode.
 * All data sources are from the NASA Space Apps 2026 challenge resources page.
 */
export async function fetchTelemetryBundle(lat: number, lon: number): Promise<LiveTelemetryBundle> {
  try {
    const res = await fetch(`${API_BASE}/weather/current?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json();
      const cmrMap: Record<string, NasaCmrGranule[]> = {};
      for (const item of data.nasaCmrGranules || []) {
        cmrMap[item.shortName] = item.latestGranules || [];
      }
      return {
        nasaAvailable: Boolean(data.nasaPowerDaily?.available),
        forecastAvailable: Boolean(data.nldasGldas?.available),
        cmrAvailable: Object.keys(cmrMap).length > 0,
        retrievedAt: new Date().toISOString(),
        observations: data.nasaPowerDaily?.observations || [],
        climatologyAnnualRainMm: data.nasaClimatology?.annualPrecipMm ?? null,
        cmrGranulesByProduct: cmrMap,
        forecastDaily: data.nldasGldas?.daily?.map((d: Record<string, unknown>) => ({
          date: String(d.date ?? ''),
          precipSumMm: Number(d.precipSumMm as number ?? 0),
          precipProbMaxPct: Number(d.precipProbMaxPct as number ?? 0),
          tempMaxC: Number(d.tempMaxC as number ?? 0),
          tempMinC: Number(d.tempMinC as number ?? 0),
          windSpeedMaxMs: Number(d.windSpeedMaxMs as number ?? 0),
          windGustsMaxMs: Number(d.windGustsMaxMs as number ?? 0)
        })) || [],
        forecastHourly: data.nldasGldas?.hourly?.map((h: Record<string, unknown>) => ({
          timestamp: String(h.timestamp ?? ''),
          temp2mC: Number(h.temp2mC as number ?? 0),
          relHumidity2mPct: Math.round(h.relHumidity2mPct as number ?? 0),
          precipProbPct: Math.round(h.precipProbPct as number ?? 0),
          precipMm: Number(h.precipMm as number ?? 0),
          windSpeed10mMs: Number(h.windSpeed10mMs as number ?? 0),
          windGusts10mMs: Number(h.windGusts10mMs as number ?? 0)
        })) || []
      };
    }
  } catch {
    // Fall through to direct NASA POWER + NASA CMR + NASA GLDAS/NLDAS HTTPS calls
  }

  const end = new Date();
  const start = new Date(end.getTime() - 48 * 24 * 60 * 60 * 1000);
  const nasaDailyUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,RH2M,WS2M,ALLSKY_SFC_SW_DWN,GWETTOP,GWETROOT&community=AG&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&start=${formatYmd(start)}&end=${formatYmd(end)}&format=JSON`;
  const nasaClimUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=PRECTOTCORR,T2M&community=AG&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`;
  const cmrImergUrl = `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=GPM_3IMERGDL&point=${lon.toFixed(4)},${lat.toFixed(4)}&sort_key=-start_date&page_size=2`;
  const cmrSmapUrl = `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=SPL3SMP_E&point=${lon.toFixed(4)},${lat.toFixed(4)}&sort_key=-start_date&page_size=2`;
  const cmrModisUrl = `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=MOD13Q1&point=${lon.toFixed(4)},${lat.toFixed(4)}&sort_key=-start_date&page_size=2`;
  const nldasUrl = `https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/GLDAS/GLDAS_NOAH025_3H.2.1?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`;

  const settled = await Promise.allSettled([
    fetch(nasaDailyUrl).then((r) => r.json()),
    fetch(nasaClimUrl).then((r) => r.json()),
    fetch(cmrImergUrl).then((r) => r.json()),
    fetch(cmrSmapUrl).then((r) => r.json()),
    fetch(cmrModisUrl).then((r) => r.json()),
    fetch(nldasUrl).then((r) => r.json())
  ]);

  const observations: DailyNasaObservation[] = [];
  if (settled[0].status === 'fulfilled' && settled[0].value?.properties?.parameter?.PRECTOTCORR) {
    const p = settled[0].value.properties.parameter;
    for (const ymd of Object.keys(p.PRECTOTCORR).sort()) {
      const precipMm = cleanNasaVal(p.PRECTOTCORR[ymd]);
      const tempMeanC = cleanNasaVal(p.T2M?.[ymd]);
      if (precipMm === null && tempMeanC === null) continue;
      observations.push({
        date: `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`,
        precipMm,
        tempMeanC,
        tempMaxC: cleanNasaVal(p.T2M_MAX?.[ymd]),
        tempMinC: cleanNasaVal(p.T2M_MIN?.[ymd]),
        relHumidityPct: cleanNasaVal(p.RH2M?.[ymd]),
        windSpeed2mMs: cleanNasaVal(p.WS2M?.[ymd]),
        solarRadKwhM2: cleanNasaVal(p.ALLSKY_SFC_SW_DWN?.[ymd]),
        surfaceSoilWetness: cleanNasaVal(p.GWETTOP?.[ymd]),
        rootSoilWetness: cleanNasaVal(p.GWETROOT?.[ymd])
      });
    }
  }

  let climatologyAnnualRainMm: number | null = null;
  if (settled[1].status === 'fulfilled' && settled[1].value?.properties?.parameter?.PRECTOTCORR?.ANN) {
    climatologyAnnualRainMm = Number((settled[1].value.properties.parameter.PRECTOTCORR.ANN * 365.25).toFixed(1));
  }

  const parseCmr = (idx: number, shortName: string): NasaCmrGranule[] => {
    if (settled[idx].status !== 'fulfilled') return [];
    const entries = settled[idx].value?.feed?.entry || [];
    return entries.map((e: Record<string, unknown>) => ({
      granuleId: String(e.id || ''),
      title: String(e.title || ''),
      shortName,
      version: String(e.version_id || ''),
      timeStart: String(e.time_start || ''),
      timeEnd: String(e.time_end || ''),
      dataCenter: String(e.data_center || 'NASA EOSDIS'),
      downloadUrl: null,
      browseUrl: null
    }));
  };

  const cmrGranulesByProduct: Record<string, NasaCmrGranule[]> = {
    GPM_3IMERGDL: parseCmr(2, 'GPM_3IMERGDL'),
    SPL3SMP_E: parseCmr(3, 'SPL3SMP_E'),
    MOD13Q1: parseCmr(4, 'MOD13Q1')
  };

  const forecastDaily: DailyForecastPoint[] = [];
  const forecastHourly: HourlyForecastPoint[] = [];
  if (settled[5].status === 'fulfilled' && settled[5].value) {
    const nldas = settled[5].value;
    const daily = nldas.daily || [];
    const hourly = nldas.hourly || [];
    daily.forEach((d: Record<string, unknown>) => {
      forecastDaily.push({
        date: String(d.date ?? ''),
        precipSumMm: Number(d.precipSumMm as number ?? 0),
        precipProbMaxPct: Number(d.precipProbMaxPct as number ?? 0),
        tempMaxC: Number(d.tempMaxC as number ?? 0),
        tempMinC: Number(d.tempMinC as number ?? 0),
        windSpeedMaxMs: Number(d.windSpeedMaxMs as number ?? 0),
        windGustsMaxMs: Number(d.windGustsMaxMs as number ?? 0)
      });
    });
    hourly.forEach((h: Record<string, unknown>) => {
      forecastHourly.push({
        timestamp: String(h.timestamp ?? ''),
        temp2mC: Number(h.temp2mC as number ?? 0),
        relHumidity2mPct: Math.round(h.relHumidity2mPct as number ?? 0),
        precipProbPct: Math.round(h.precipProbPct as number ?? 0),
        precipMm: Number(h.precipMm as number ?? 0),
        windSpeed10mMs: Number(h.windSpeed10mMs as number ?? 0),
        windGusts10mMs: Number(h.windGusts10mMs as number ?? 0)
      });
    });
  }

  return {
    nasaAvailable: observations.length > 0,
    forecastAvailable: forecastDaily.length > 0,
    cmrAvailable: Object.values(cmrGranulesByProduct).some((arr) => arr.length > 0),
    retrievedAt: new Date().toISOString(),
    observations,
    climatologyAnnualRainMm,
    cmrGranulesByProduct,
    forecastDaily,
    forecastHourly
  };
}

/** Farm API — reads/writes farm records through the Express backend. */
export async function fetchFarms(): Promise<FarmProfileRecord[]> {
  const res = await fetch(`${API_BASE}/farms`);
  if (!res.ok) throw new Error(`Farms API HTTP ${res.status}`);
  const json = await res.json();
  return json.farms || [];
}

export async function createFarmRecord(farm: Omit<FarmProfileRecord, 'id'>): Promise<FarmProfileRecord> {
  const res = await fetch(`${API_BASE}/farms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(farm)
  });
  if (!res.ok) throw new Error(`Create Farm API HTTP ${res.status}`);
  const json = await res.json();
  return json.farm;
}

export async function analyzeRotationViaApi(payload: RotationAnalyzeRequest) {
  const res = await fetch(`${API_BASE}/rotation/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Rotation API HTTP ${res.status}`);
  return res.json();
}
