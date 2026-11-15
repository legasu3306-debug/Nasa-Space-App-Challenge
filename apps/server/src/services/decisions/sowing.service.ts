import { DailyNasaObservation, DailyForecastPoint, SowingQueryInput } from '@fieldshift/shared';

export function evaluateSowingOnsetDecision(
  observations: DailyNasaObservation[],
  forecastDaily: DailyForecastPoint[],
  config: Pick<SowingQueryInput, 'onsetWindowDays' | 'onsetThresholdMm' | 'wetDayThresholdMm' | 'maxDrySpellDaysAllowed'>
) {
  const validObs = observations.filter((o) => o.precipMm !== null);
  if (validObs.length < 14) {
    return {
      onsetStatus: 'INSUFFICIENT_EVIDENCE' as const,
      decisionState: 'Insufficient evidence' as const,
      headline: 'Insufficient live NASA rainfall observations to verify seasonal onset.',
      explanation:
        'Fewer than 14 valid NASA precipitation days were returned. Never guess rainfall onset from missing or fabricated data.',
      metrics: {
        validObservedDaysCount: validObs.length,
        accumulatedLast3DaysMm: 0,
        accumulatedLast14DaysMm: 0,
        accumulatedLast30DaysMm: 0,
        rainyDaysLast14: 0,
        currentConsecutiveDryDays: 0,
        maxDrySpellLast30Days: 0,
        upcoming7DayForecastMm: null
      },
      rollingSeries: []
    };
  }

  const last30 = validObs.slice(-30);
  const last14 = validObs.slice(-14);
  const lastW = validObs.slice(-config.onsetWindowDays);

  const sumP = (arr: DailyNasaObservation[]) =>
    Number(arr.reduce((acc, r) => acc + (r.precipMm ?? 0), 0).toFixed(1));

  const accumulatedLast3DaysMm = sumP(lastW);
  const accumulatedLast14DaysMm = sumP(last14);
  const accumulatedLast30DaysMm = sumP(last30);
  const rainyDaysLast14 = last14.filter((r) => (r.precipMm ?? 0) >= config.wetDayThresholdMm).length;

  let currentConsecutiveDryDays = 0;
  for (let i = last30.length - 1; i >= 0; i--) {
    if ((last30[i].precipMm ?? 0) < config.wetDayThresholdMm) currentConsecutiveDryDays++;
    else break;
  }

  let maxDrySpellLast30Days = 0;
  let curDry = 0;
  for (const obs of last30) {
    if ((obs.precipMm ?? 0) < config.wetDayThresholdMm) {
      curDry++;
      if (curDry > maxDrySpellLast30Days) maxDrySpellLast30Days = curDry;
    } else {
      curDry = 0;
    }
  }

  let peakRollingMm = 0;
  const rollingSeries = last30.map((obs, idx) => {
    const startIdx = Math.max(0, idx - (config.onsetWindowDays - 1));
    const rollingMm = sumP(last30.slice(startIdx, idx + 1));
    if (idx >= last30.length - 14 && rollingMm > peakRollingMm) {
      peakRollingMm = rollingMm;
    }
    return { date: obs.date, dailyMm: obs.precipMm ?? 0, rollingMm };
  });

  const upcoming7DayForecastMm =
    forecastDaily.length > 0
      ? Number(forecastDaily.reduce((a, d) => a + d.precipSumMm, 0).toFixed(1))
      : null;

  const isEstablished =
    peakRollingMm >= config.onsetThresholdMm &&
    rainyDaysLast14 >= 3 &&
    currentConsecutiveDryDays <= config.maxDrySpellDaysAllowed &&
    (upcoming7DayForecastMm === null || upcoming7DayForecastMm >= 8.0);

  const isPossible =
    !isEstablished &&
    (peakRollingMm >= config.onsetThresholdMm * 0.65 || accumulatedLast14DaysMm >= config.onsetThresholdMm);

  return {
    onsetStatus: isEstablished
      ? ('ONSET_ESTABLISHED' as const)
      : isPossible
      ? ('POSSIBLE_ONSET' as const)
      : ('ONSET_NOT_ESTABLISHED' as const),
    decisionState: isEstablished ? ('Suitable' as const) : ('Risky' as const),
    headline: isEstablished
      ? 'Onset Established — Rainfall accumulation and persistence criteria met.'
      : isPossible
      ? 'Possible Onset — Initial rainfall recorded, but dry-spell persistence risk remains.'
      : 'Onset Not Established — Recent rainfall is below seasonal onset thresholds.',
    explanation: `Peak ${config.onsetWindowDays}-day NASA rainfall is ${peakRollingMm} mm (threshold: ${config.onsetThresholdMm} mm) across ${rainyDaysLast14} wet days in the last 14 days, with ${currentConsecutiveDryDays} current dry days and ${upcoming7DayForecastMm ?? 'N/A'} mm forecast over the next 7 days.`,
    metrics: {
      validObservedDaysCount: validObs.length,
      accumulatedLast3DaysMm,
      accumulatedLast14DaysMm,
      accumulatedLast30DaysMm,
      rainyDaysLast14,
      currentConsecutiveDryDays,
      maxDrySpellLast30Days,
      upcoming7DayForecastMm
    },
    rollingSeries
  };
}
