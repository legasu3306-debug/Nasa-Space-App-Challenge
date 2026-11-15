import React from 'react';
import type { LiveTelemetryBundle } from '../lib/api.js';
import type { FarmProfileRecord } from '../lib/offlineDb.js';
import { MetricCard } from '../components/ui/MetricCard.js';

interface PageProps {
  farm: FarmProfileRecord;
  telemetry?: LiveTelemetryBundle;
  isLoading: boolean;
}

export const ThreshingPage: React.FC<PageProps> = ({ farm, telemetry, isLoading }) => {
  const obs = telemetry?.observations || [];
  const latest = obs[obs.length - 1];
  const imergGranules = telemetry?.cmrGranulesByProduct?.GPM_3IMERGDL || [];
  const smapGranules = telemetry?.cmrGranulesByProduct?.SPL3SMP_E || [];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 space-y-4 shadow-sm">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#245B3C]">
          {farm.name} ({farm.woreda}, {farm.region})
        </span>
        <h1 className="text-xl font-bold text-[#202B24] mt-0.5">Threshing & Winnowing Sub-Daily Windows</h1>
        <p className="text-xs sm:text-sm text-[#748077]">Morning, Afternoon, and Evening comparison across rain risk, relative humidity, and provisional wind thresholds.</p>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-sm text-[#748077]">
          Querying live NASA POWER, NASA CMR Granule Search, and Open-Meteo endpoints...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Latest NASA Precip"
            value={latest?.precipMm !== null && latest?.precipMm !== undefined ? `${latest.precipMm} mm` : 'Unavailable'}
            subtitle={latest?.date || 'NASA POWER PRECTOTCORR'}
            sourceBadge="NASA POWER"
          />
          <MetricCard
            label="30-Yr Annual Climatology"
            value={telemetry?.climatologyAnnualRainMm ? `${telemetry.climatologyAnnualRainMm} mm/yr` : 'Unavailable'}
            subtitle="NASA POWER AG Climatology"
            sourceBadge="NASA CLIM"
          />
          <MetricCard
            label="GPM IMERG V07B Pass"
            value={imergGranules[0]?.timeStart ? imergGranules[0].timeStart.slice(0, 10) : 'CMR Ready'}
            subtitle={imergGranules[0]?.title || 'GPM_3IMERGDL 0.1°'}
            sourceBadge="NASA CMR"
          />
          <MetricCard
            label="SMAP 9km Soil Pass"
            value={smapGranules[0]?.timeStart ? smapGranules[0].timeStart.slice(0, 10) : 'CMR Ready'}
            subtitle={smapGranules[0]?.title || 'SPL3SMP_E 9km'}
            sourceBadge="NASA SMAP"
          />
        </div>
      )}
    </div>
  );
};
