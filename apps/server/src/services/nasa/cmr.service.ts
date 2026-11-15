import { env } from '../../config/env.js';
import { NasaCmrGranule } from '@fieldshift/shared';

export interface CmrProductPassSummary {
  shortName: string;
  datasetTitle: string;
  available: boolean;
  totalHits: number;
  latestGranules: NasaCmrGranule[];
  queryUrl: string;
}

/**
 * Queries the real, keyless NASA Common Metadata Repository (CMR) Granule Search API
 * (`https://cmr.earthdata.nasa.gov/search/granules.json`) for exact coordinate passes
 * across the NASA Space Apps Field Shift datasets:
 * - GPM_3IMERGDF / GPM_3IMERGDL (GPM IMERG V07B Daily Precipitation)
 * - SPL3SMP_E / SPL3SMP (SMAP L3 Daily Soil Moisture 9km / 36km)
 * - MOD13Q1 / VNP13A1 (MODIS Terra 250m & VIIRS 500m 16-Day NDVI/EVI)
 * - ECO2LSTE (ECOSTRESS 70m Land Surface Temperature & Emissivity)
 * - SRTMGL1 (NASA Shuttle Radar Topography Mission 30m DEM)
 */
export async function searchNasaCmrGranulesAtPoint(
  shortName: string,
  latitude: number,
  longitude: number,
  pageSize = 3
): Promise<CmrProductPassSummary> {
  const queryUrl = `${env.NASA_CMR_SEARCH_URL}/granules.json?short_name=${encodeURIComponent(shortName)}&point=${longitude.toFixed(4)},${latitude.toFixed(4)}&sort_key=-start_date&page_size=${pageSize}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.EXTERNAL_API_TIMEOUT_MS);

  try {
    const res = await fetch(queryUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`NASA CMR HTTP ${res.status}`);
    }

    const totalHits = Number(res.headers.get('CMR-Hits') || '0');
    const payload = (await res.json()) as {
      feed?: {
        entry?: Array<{
          id: string;
          title: string;
          dataset_id?: string;
          version_id?: string;
          time_start?: string;
          time_end?: string;
          data_center?: string;
          links?: Array<{ rel?: string; href?: string }>;
        }>;
      };
    };

    const entries = payload?.feed?.entry || [];
    const latestGranules: NasaCmrGranule[] = entries.map((e) => {
      const dataLink = e.links?.find((l) => l.rel?.includes('/data#'))?.href || null;
      const browseLink = e.links?.find((l) => l.rel?.includes('/browse#'))?.href || null;
      return {
        granuleId: e.id,
        title: e.title,
        shortName,
        version: e.version_id || 'latest',
        timeStart: e.time_start || '',
        timeEnd: e.time_end || '',
        dataCenter: e.data_center || 'NASA EOSDIS',
        downloadUrl: dataLink,
        browseUrl: browseLink
      };
    });

    return {
      shortName,
      datasetTitle: entries[0]?.dataset_id || shortName,
      available: latestGranules.length > 0,
      totalHits: totalHits || latestGranules.length,
      latestGranules,
      queryUrl
    };
  } catch {
    clearTimeout(timer);
    return {
      shortName,
      datasetTitle: shortName,
      available: false,
      totalHits: 0,
      latestGranules: [],
      queryUrl
    };
  }
}

export async function fetchAllFieldShiftNasaGranules(latitude: number, longitude: number) {
  const products = ['GPM_3IMERGDL', 'SPL3SMP_E', 'MOD13Q1', 'ECO2LSTE', 'SRTMGL1'];
  const results = await Promise.all(
    products.map((shortName) => searchNasaCmrGranulesAtPoint(shortName, latitude, longitude, 2))
  );
  return results;
}
