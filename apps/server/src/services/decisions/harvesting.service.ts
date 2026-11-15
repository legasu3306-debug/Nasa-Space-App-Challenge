import { DailyNasaObservation, DailyForecastPoint } from '@fieldshift/shared';

export function evaluateHarvestWindowsDecision(
  observations: DailyNasaObservation[],
  forecastDaily: DailyForecastPoint[]
) {
  const validObs = observations.filter((o) => o.precipMm !== null).slice(-7);
  const recent7DayRainMm =
    validObs.length > 0
      ? Number(validObs.reduce((a, o) => a + (o.precipMm ?? 0), 0).toFixed(1))
      : null;

  if (forecastDaily.length < 3) {
    return {
      decisionState: 'Insufficient evidence' as const,
      headline: 'Operational 7-day forecast unavailable for harvest window analysis.',
      recent7DayRainMm,
      windows: []
    };
  }

  const windows = [];
  for (let i = 0; i <= forecastDaily.length - 3; i++) {
    const slice = forecastDaily.slice(i, i + 3);
    const maxRainProbPct = Math.max(...slice.map((d) => d.precipProbMaxPct));
    const totalExpectedRainMm = Number(slice.reduce((a, d) => a + d.precipSumMm, 0).toFixed(1));
    const avgTempMaxC = Number((slice.reduce((a, d) => a + d.tempMaxC, 0) / 3).toFixed(1));
    const suitable = maxRainProbPct <= 30 && totalExpectedRainMm <= 2.0;

    windows.push({
      startDate: slice[0].date,
      endDate: slice[2].date,
      maxRainProbPct,
      totalExpectedRainMm,
      avgTempMaxC,
      suitability: suitable ? ('Suitable' as const) : ('Risky' as const)
    });
  }

  const best = windows.find((w) => w.suitability === 'Suitable');
  return {
    decisionState: best ? ('Suitable' as const) : ('Risky' as const),
    headline: best
      ? `Relatively dry 3-day harvest window identified (${best.startDate} to ${best.endDate}).`
      : 'Elevated forecast rainfall risk across upcoming 3-day windows.',
    recent7DayRainMm,
    windows
  };
}
