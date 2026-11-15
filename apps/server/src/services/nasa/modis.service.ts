import { env } from '../../config/env.js';
import { DataProvenance } from '@fieldshift/shared';

export interface ModisOrnlResult {
  available: boolean;
  latestCompositeDate: string | null;
  availableCompositeCount: number;
  provenance: DataProvenance;
  scientificNote: string;
}

/**
 * Connects to the real NASA ORNL DAAC MODIS Global Subset REST API
 * (`https://modis.ornl.gov/rst/api/v1/MOD13Q1/dates?latitude=...&longitude=...`)
 */
export async function fetchModisOrnlDates(
  latitude: number,
  longitude: number
): Promise<ModisOrnlResult> {
  const url = `${env.NASA_ORNL_MODIS_URL}/MOD13Q1/dates?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.EXTERNAL_API_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`ORNL DAAC HTTP ${res.status}`);

    const data = (await res.json()) as {
      dates?: Array<{ calendar_date: string; modis_date: string }>;
    };
    const dates = data?.dates || [];
    const latest = dates[dates.length - 1]?.calendar_date || null;

    return {
      available: dates.length > 0,
      latestCompositeDate: latest,
      availableCompositeCount: dates.length,
      provenance: {
        provider: 'NASA LP DAAC / ORNL DAAC TESViS',
        productIdentifier: 'MOD13Q1.061 (Terra MODIS 250m 16-Day NDVI/EVI)',
        productVersion: '061',
        observationPeriod: latest ? `2000-02-18 to ${latest}` : 'Unavailable',
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '250 m',
        unit: 'NDVI (-0.2 to 1.0)',
        processingMethod: '16-day surface reflectance composite via ORNL DAAC REST API',
        dataType: 'OBSERVED',
        isStale: false,
        sourceUrl: 'https://modis.ornl.gov/data/modis_webservice.html'
      },
      scientificNote:
        'MODIS 250m NDVI tracks canopy greenness and seasonal phenology. It NEVER proves biological grain maturity or safe grain moisture for storage.'
    };
  } catch {
    clearTimeout(timer);
    return {
      available: false,
      latestCompositeDate: null,
      availableCompositeCount: 0,
      provenance: {
        provider: 'NASA LP DAAC / ORNL DAAC TESViS',
        productIdentifier: 'MOD13Q1.061',
        productVersion: '061',
        observationPeriod: 'Unavailable',
        retrievedAt: new Date().toISOString(),
        latitude,
        longitude,
        spatialResolution: '250 m',
        unit: 'NDVI',
        processingMethod: 'ORNL DAAC endpoint unreachable',
        dataType: 'OBSERVED',
        isStale: true,
        sourceUrl: 'https://modis.ornl.gov/data/modis_webservice.html'
      },
      scientificNote:
        'MODIS NDVI endpoint unreachable; crop maturity relies on planting date, FAO crop duration, and physical field inspection.'
    };
  }
}
