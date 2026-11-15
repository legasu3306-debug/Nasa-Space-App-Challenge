import { HourlyForecastPoint, ThreshingQueryInput } from '@fieldshift/shared';

export function evaluateThreshingWindowsDecision(
  hourly: HourlyForecastPoint[],
  thresholds: Omit<ThreshingQueryInput, 'lat' | 'lon'>
) {
  if (!hourly || hourly.length < 24) {
    return {
      decisionState: 'Insufficient evidence' as const,
      provisionalNotice: 'Wind thresholds are provisional until locally calibrated with extension agents.',
      slots: []
    };
  }

  const buckets = new Map<string, HourlyForecastPoint[]>();
  for (const pt of hourly.slice(0, 72)) {
    const [dPart, tPart] = pt.timestamp.split('T');
    const hr = parseInt(tPart?.slice(0, 2) || '0', 10);
    let period = '';
    if (hr >= 6 && hr < 12) period = 'Morning (06:00–11:59)';
    else if (hr >= 12 && hr < 18) period = 'Afternoon (12:00–17:59)';
    else if (hr >= 18 && hr < 22) period = 'Evening (18:00–21:59)';
    if (!period) continue;

    const key = `${dPart}__${period}`;
    const arr = buckets.get(key) || [];
    arr.push(pt);
    buckets.set(key, arr);
  }

  const slots = [];
  for (const [key, pts] of buckets.entries()) {
    const [date, periodLabel] = key.split('__');
    const maxRainProbPct = Math.max(...pts.map((p) => p.precipProbPct));
    const expectedRainMm = Number(pts.reduce((a, p) => a + p.precipMm, 0).toFixed(2));
    const avgWindSpeedMs = Number((pts.reduce((a, p) => a + p.windSpeed10mMs, 0) / pts.length).toFixed(1));
    const maxWindGustMs = Number(Math.max(...pts.map((p) => p.windGusts10mMs)).toFixed(1));
    const avgHumidityPct = Math.round(pts.reduce((a, p) => a + p.relHumidity2mPct, 0) / pts.length);
    const avgTempC = Number((pts.reduce((a, p) => a + p.temp2mC, 0) / pts.length).toFixed(1));

    const dryingOk =
      maxRainProbPct <= thresholds.maxRainProbPct &&
      expectedRainMm === 0 &&
      avgHumidityPct <= thresholds.maxHumidityPct;
    const winnowOk =
      dryingOk &&
      avgWindSpeedMs >= thresholds.minWinnowWindMs &&
      avgWindSpeedMs <= thresholds.maxWinnowWindMs &&
      maxWindGustMs <= thresholds.maxGustWindMs;

    slots.push({
      date,
      periodLabel,
      maxRainProbPct,
      expectedRainMm,
      avgWindSpeedMs,
      maxWindGustMs,
      avgHumidityPct,
      avgTempC,
      dryingAssessment: dryingOk ? ('Suitable' as const) : ('Risky' as const),
      winnowingAssessment: winnowOk ? ('Suitable' as const) : ('Risky' as const),
      overallAssessment: winnowOk ? ('Suitable' as const) : ('Risky' as const)
    });
  }

  return {
    decisionState: slots.some((s) => s.overallAssessment === 'Suitable')
      ? ('Suitable' as const)
      : ('Risky' as const),
    provisionalNotice:
      'Wind speed thresholds (default 2.5–7.5 m/s) are PROVISIONAL reference guides and must be calibrated for specific grain density (Teff vs. Wheat/Pulses).',
    slots
  };
}
