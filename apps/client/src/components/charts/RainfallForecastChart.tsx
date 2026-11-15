import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import type { DailyNasaObservation, DailyForecastPoint } from '@fieldshift/shared';

interface Props {
  observations: DailyNasaObservation[];
  forecastDaily: DailyForecastPoint[];
}

export const RainfallForecastChart: React.FC<Props> = ({ observations, forecastDaily }) => {
  const data = [
    ...observations.slice(-14).map((o) => ({
      date: o.date.slice(5),
      nasaRainMm: o.precipMm,
      forecastRainMm: null,
      tempMaxC: o.tempMaxC
    })),
    ...forecastDaily.map((f) => ({
      date: `${f.date.slice(5)} (Fc)`,
      nasaRainMm: null,
      forecastRainMm: f.precipSumMm,
      tempMaxC: f.tempMaxC
    }))
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'mm/day', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: '°C', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="nasaRainMm" name="NASA POWER Rain (mm)" fill="#245B3C" />
          <Bar yAxisId="left" dataKey="forecastRainMm" name="Open-Meteo Forecast (Non-NASA, mm)" fill="#A66B45" />
          <Line yAxisId="right" type="monotone" dataKey="tempMaxC" name="Max Temp (°C)" stroke="#829B77" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
