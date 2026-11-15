import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import type { DailyNasaObservation } from '@fieldshift/shared';

export const SoilMoistureChart: React.FC<{ observations: DailyNasaObservation[] }> = ({ observations }) => {
  const data = observations.slice(-30).map((o) => ({
    date: o.date.slice(5),
    gwetRoot: o.rootSoilWetness,
    gwetTop: o.surfaceSoilWetness,
    rhPct: o.relHumidityPct
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" domain={[0, 1]} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="gwetRoot" name="Root-Zone Wetness (GWETROOT 0-1)" stroke="#245B3C" strokeWidth={2} dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="gwetTop" name="Surface Wetness (GWETTOP 0-1)" stroke="#A66B45" strokeDasharray="4 4" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="rhPct" name="Relative Humidity (%)" stroke="#748077" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
