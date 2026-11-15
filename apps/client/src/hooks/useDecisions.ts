import { useMemo } from 'react';
import type { LiveTelemetryBundle } from '../lib/api.js';

export function useDecisions(
  telemetry: LiveTelemetryBundle | undefined,
  onsetThresholdMm = 20,
  minWindMs = 2.5,
  maxWindMs = 7.5
) {
  return useMemo(() => {
    const obs = (telemetry?.observations || []).filter((o) => o.precipMm !== null);
    const fcDaily = telemetry?.forecastDaily || [];
    const fcHourly = telemetry?.forecastHourly || [];

    const last14 = obs.slice(-14);
    const rain14Mm = Number(last14.reduce((a, o) => a + (o.precipMm ?? 0), 0).toFixed(1));
    const wetDays14 = last14.filter((o) => (o.precipMm ?? 0) >= 1.0).length;
    const fc7Mm = Number(fcDaily.reduce((a, d) => a + d.precipSumMm, 0).toFixed(1));

    const sowingState =
      obs.length < 10
        ? ('Insufficient evidence' as const)
        : rain14Mm >= onsetThresholdMm && wetDays14 >= 3
        ? ('Suitable' as const)
        : ('Risky' as const);

    const lowRainWindows = fcDaily.filter((d) => d.precipProbMaxPct <= 30 && d.precipSumMm <= 1.5);
    const harvestingState =
      fcDaily.length === 0
        ? ('Insufficient evidence' as const)
        : lowRainWindows.length >= 3
        ? ('Suitable' as const)
        : ('Risky' as const);

    const suitableWindHours = fcHourly.filter(
      (h) => h.precipProbPct <= 20 && h.relHumidity2mPct <= 65 && h.windSpeed10mMs >= minWindMs && h.windSpeed10mMs <= maxWindMs
    );
    const threshingState =
      fcHourly.length === 0
        ? ('Insufficient evidence' as const)
        : suitableWindHours.length >= 4
        ? ('Suitable' as const)
        : ('Risky' as const);

    return {
      rain14Mm,
      wetDays14,
      fc7Mm,
      sowingState,
      harvestingState,
      threshingState
    };
  }, [telemetry, onsetThresholdMm, minWindMs, maxWindMs]);
}
