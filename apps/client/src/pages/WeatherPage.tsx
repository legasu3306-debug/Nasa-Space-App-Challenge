import React from 'react';
import type { LiveTelemetryBundle } from '../lib/api.js';
import type { FarmProfileRecord } from '../lib/offlineDb.js';
import { RainfallForecastChart } from '../components/charts/RainfallForecastChart.js';
import { SoilMoistureChart } from '../components/charts/SoilMoistureChart.js';

interface PageProps {
  farm: FarmProfileRecord;
  telemetry?: LiveTelemetryBundle;
  isLoading: boolean;
}

export const WeatherPage: React.FC<PageProps> = ({ farm, telemetry }) => (
  <div className="space-y-5">
    <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 shadow-sm">
      <h1 className="text-xl font-bold text-[#202B24]">
        Agricultural Weather &amp; NASA Earth Observation Series — {farm.name}
      </h1>
      <p className="text-xs text-[#748077] mb-4">
        NASA LaRC POWER daily agroclimatology (0.5° × 0.625°) paired with Open-Meteo 7-day forecast (explicitly labelled External Non-NASA).
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#E2E8E0]">
          <h3 className="font-bold text-sm mb-2">Daily Precipitation &amp; Temperature</h3>
          <RainfallForecastChart
            observations={telemetry?.observations || []}
            forecastDaily={telemetry?.forecastDaily || []}
          />
        </div>
        <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#E2E8E0]">
          <h3 className="font-bold text-sm mb-2">Surface (GWETTOP) &amp; Root-Zone (GWETROOT) Soil Wetness</h3>
          <SoilMoistureChart observations={telemetry?.observations || []} />
        </div>
      </div>
    </div>
  </div>
);
