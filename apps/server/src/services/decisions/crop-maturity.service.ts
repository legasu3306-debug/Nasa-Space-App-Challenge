import { CropMaturityRequestInput, DailyForecastPoint } from '@fieldshift/shared';
import { DOCUMENTED_CROPS } from '../rotation/rotation.service.js';

export function evaluateCropMaturityDecision(
  input: CropMaturityRequestInput,
  forecastDaily: DailyForecastPoint[]
) {
  const crop = DOCUMENTED_CROPS.find((c) => c.code === input.cropCode) || DOCUMENTED_CROPS[0];
  const planted = new Date(input.plantingDateIso);
  const now = new Date();
  const daysElapsed = Math.max(0, Math.round((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24)));

  const isMature =
    input.observedStage === 'HARVEST_READY' ||
    (input.observedStage === 'PHYSIOLOGICAL_MATURITY' && input.grainDryness === 'HARD_DRY');

  const fc5 = forecastDaily.slice(0, 5);
  const rain5Mm = fc5.length > 0 ? Number(fc5.reduce((a, d) => a + d.precipSumMm, 0).toFixed(1)) : null;
  const maxProb5 = fc5.length > 0 ? Math.max(...fc5.map((d) => d.precipProbMaxPct)) : null;

  let weatherRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN' = 'UNKNOWN';
  if (rain5Mm !== null && maxProb5 !== null) {
    if (rain5Mm >= 10 || maxProb5 >= 60) weatherRisk = 'HIGH';
    else if (rain5Mm >= 2.5 || maxProb5 >= 30) weatherRisk = 'MODERATE';
    else weatherRisk = 'LOW';
  }

  const storageWarning =
    input.measuredMoisturePct === undefined || input.measuredMoisturePct === null
      ? 'CRITICAL STORAGE WARNING: Actual grain moisture has not been measured with a moisture meter. FieldShift cannot verify storage readiness from satellite NDVI or weather data alone. Moist grain stored in bulk bags or bins will heat, mold, and spoil.'
      : input.measuredMoisturePct > 13.0
      ? `Measured grain moisture (${input.measuredMoisturePct}%) exceeds safe bulk storage limit (~12.5–13%). Sun-dry thoroughly before bagging.`
      : `Measured grain moisture (${input.measuredMoisturePct}%) is within typical safe dry range.`;

  return {
    cropName: crop.nameEn,
    daysElapsed,
    documentedDurationDays: `${crop.durationMin}–${crop.durationMax} days`,
    cropMaturityStatus: isMature ? 'MATURE_READY' : 'NOT_YET_READY',
    upcomingWeatherRisk: weatherRisk,
    decisionState: isMature && weatherRisk === 'LOW' ? ('Suitable' as const) : ('Risky' as const),
    storageWarning
  };
}
