import React from 'react';
import { Link } from 'react-router-dom';
import type { LiveTelemetryBundle } from '../lib/api.js';
import type { FarmProfileRecord } from '../lib/offlineDb.js';
import { MetricCard } from '../components/ui/MetricCard.js';
import { DecisionBadge } from '../components/ui/DecisionBadge.js';
import { RainfallForecastChart } from '../components/charts/RainfallForecastChart.js';
import { useDecisions } from '../hooks/useDecisions.js';

interface PageProps {
  farm: FarmProfileRecord;
  telemetry?: LiveTelemetryBundle;
  isLoading: boolean;
}

export const DashboardPage: React.FC<PageProps> = ({ farm, telemetry, isLoading }) => {
  const decisions = useDecisions(telemetry);
  const obs = telemetry?.observations || [];
  const latest = obs[obs.length - 1];
  const imerg = telemetry?.cmrGranulesByProduct?.GPM_3IMERGDL?.[0];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#245B3C]">
              {farm.zone} • {farm.region} ({farm.elevationMeters} m a.s.l.)
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#202B24] mt-0.5">{farm.name}</h1>
            <p className="text-xs text-[#748077]">
              Farmer/DA: {farm.farmerName} • Active Crop: {farm.currentCropCode} • Soil: {farm.soilType}
            </p>
          </div>
          <div className="text-xs font-mono bg-[#E8F0E9] text-[#245B3C] px-3 py-1.5 rounded-lg">
            {farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#E2E8E0]">
          <MetricCard
            label="14-Day NASA Rainfall"
            value={isLoading ? 'Loading...' : `${decisions.rain14Mm} mm`}
            subtitle={`${decisions.wetDays14} wet days (NASA POWER)`}
            sourceBadge="NASA POWER"
          />
          <MetricCard
            label="7-Day Forecast Rain"
            value={isLoading ? 'Loading...' : `${decisions.fc7Mm} mm`}
            subtitle="Open-Meteo IFS/GFS"
            sourceBadge="NON-NASA"
            isExternalForecast
          />
          <MetricCard
            label="Root-Zone Soil Wetness"
            value={latest?.rootSoilWetness !== null && latest?.rootSoilWetness !== undefined ? latest.rootSoilWetness.toFixed(2) : 'Unavailable'}
            subtitle={`Surface GWETTOP: ${latest?.surfaceSoilWetness ?? '--'}`}
            sourceBadge="GWETROOT"
          />
          <MetricCard
            label="Latest GPM IMERG Pass"
            value={imerg?.timeStart ? imerg.timeStart.slice(0, 10) : 'Live CMR'}
            subtitle={imerg?.title || 'GPM_3IMERGDL V07B 0.1°'}
            sourceBadge="NASA CMR"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#245B3C]">Module A.1 • Sowing</span>
            <DecisionBadge state={decisions.sowingState} />
          </div>
          <h3 className="font-bold text-sm">Rainfall Onset &amp; Dry-Spell Check</h3>
          <p className="text-xs text-[#748077]">
            14-day observed NASA rainfall: {decisions.rain14Mm} mm across {decisions.wetDays14} rainy days.
          </p>
          <Link to="/sowing" className="inline-block text-xs font-semibold text-[#245B3C] hover:underline">
            Open Sowing Analysis →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8E0] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#245B3C]">Module A.2 • Harvesting</span>
            <DecisionBadge state={decisions.harvestingState} />
          </div>
          <h3 className="font-bold text-sm">Upcoming Dry Harvest Windows</h3>
          <p className="text-xs text-[#748077]">
            7-day operational forecast total: {decisions.fc7Mm} mm. Check crop maturity before cutting.
          </p>
          <Link to="/harvesting" className="inline-block text-xs font-semibold text-[#245B3C] hover:underline">
            Open Harvest Windows →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8E0] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#245B3C]">Module A.3 • Threshing</span>
            <DecisionBadge state={decisions.threshingState} />
          </div>
          <h3 className="font-bold text-sm">Sub-Daily Winnowing &amp; Drying</h3>
          <p className="text-xs text-[#748077]">
            Compares Morning, Afternoon, and Evening wind speed (2.5–7.5 m/s provisional) and humidity.
          </p>
          <Link to="/threshing" className="inline-block text-xs font-semibold text-[#245B3C] hover:underline">
            Open Threshing Windows →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base mb-2">
          NASA POWER Observed Rainfall vs. 7-Day Operational Forecast (Non-NASA)
        </h3>
        <RainfallForecastChart
          observations={telemetry?.observations || []}
          forecastDaily={telemetry?.forecastDaily || []}
        />
      </div>
    </div>
  );
};
