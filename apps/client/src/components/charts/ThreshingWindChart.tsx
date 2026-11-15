import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import type { HourlyForecastPoint } from '@fieldshift/shared';

export const ThreshingWindChart: React.FC<{ hourly: HourlyForecastPoint[] }> = ({ hourly }) => {
  const data = hourly.slice(0, 24).map((h) => ({
    time: h.timestamp.slice(11, 16),
    windMs: h.windSpeed10mMs,
    gustMs: h.windGusts10mMs,
    rhPct: h.relHumidity2mPct
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E0" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="windMs" name="10m Wind Speed (m/s)" fill="#245B3C" />
          <Bar dataKey="gustMs" name="10m Wind Gusts (m/s)" fill="#A66B45" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
