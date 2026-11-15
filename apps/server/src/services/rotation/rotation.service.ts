import { RotationAnalyzeRequest } from '@fieldshift/shared';

export interface DocumentedCropSpec {
  code: string;
  nameEn: string;
  nameAm: string;
  nameOm: string;
  scientificName: string;
  family: 'Poaceae' | 'Fabaceae';
  durationMin: number;
  durationMax: number;
  waterNeedMin: number;
  waterNeedMax: number;
  kcAvg: number;
  droughtSensitivity: 'Low' | 'Low-Moderate' | 'Moderate' | 'High';
  optPhMin: number;
  optPhMax: number;
  preferredSoils: string[];
  nitrogenDemand: 'Low' | 'Moderate' | 'High';
  isNitrogenFixer: boolean;
  rootDepth: 'Shallow' | 'Medium' | 'Deep';
  residueCover: 'Low' | 'Moderate' | 'High';
  forageValue: 'Low' | 'Moderate' | 'High';
  sourceUrl: string;
}

export const DOCUMENTED_CROPS: DocumentedCropSpec[] = [
  {
    code: 'TEFF',
    nameEn: 'Teff',
    nameAm: 'ጤፍ (Teff)',
    nameOm: 'Xaafii',
    scientificName: 'Eragrostis tef (Zucc.) Trotter',
    family: 'Poaceae',
    durationMin: 90,
    durationMax: 130,
    waterNeedMin: 300,
    waterNeedMax: 500,
    kcAvg: 0.78,
    droughtSensitivity: 'Low-Moderate',
    optPhMin: 5.5,
    optPhMax: 7.5,
    preferredSoils: ['Vertisol', 'Nitisol', 'Loam', 'ClayLoam'],
    nitrogenDemand: 'Moderate',
    isNitrogenFixer: false,
    rootDepth: 'Shallow',
    residueCover: 'Moderate',
    forageValue: 'High',
    sourceUrl: 'https://dergipark.org.tr/tr/download/article-file/4335532'
  },
  {
    code: 'MAIZE',
    nameEn: 'Maize (Grain)',
    nameAm: 'በቆሎ (Bekolo)',
    nameOm: 'Boqqolloo',
    scientificName: 'Zea mays L.',
    family: 'Poaceae',
    durationMin: 125,
    durationMax: 180,
    waterNeedMin: 500,
    waterNeedMax: 800,
    kcAvg: 0.82,
    droughtSensitivity: 'High',
    optPhMin: 5.5,
    optPhMax: 7.0,
    preferredSoils: ['Nitisol', 'Loam', 'Andosol'],
    nitrogenDemand: 'High',
    isNitrogenFixer: false,
    rootDepth: 'Medium',
    residueCover: 'High',
    forageValue: 'High',
    sourceUrl: 'https://www.fao.org/4/u3160e/u3160e04.htm'
  },
  {
    code: 'WHEAT',
    nameEn: 'Bread / Durum Wheat',
    nameAm: 'ስንዴ (Sinde)',
    nameOm: 'Qamadii',
    scientificName: 'Triticum aestivum / durum',
    family: 'Poaceae',
    durationMin: 120,
    durationMax: 150,
    waterNeedMin: 450,
    waterNeedMax: 650,
    kcAvg: 0.78,
    droughtSensitivity: 'Moderate',
    optPhMin: 6.0,
    optPhMax: 7.5,
    preferredSoils: ['Vertisol', 'Nitisol', 'Loam', 'ClayLoam'],
    nitrogenDemand: 'High',
    isNitrogenFixer: false,
    rootDepth: 'Medium',
    residueCover: 'Moderate',
    forageValue: 'Moderate',
    sourceUrl: 'https://www.fao.org/4/u3160e/u3160e04.htm'
  },
  {
    code: 'BARLEY',
    nameEn: 'Food / Malt Barley',
    nameAm: 'ገብስ (Gebs)',
    nameOm: 'Garbuu',
    scientificName: 'Hordeum vulgare L.',
    family: 'Poaceae',
    durationMin: 120,
    durationMax: 150,
    waterNeedMin: 450,
    waterNeedMax: 600,
    kcAvg: 0.78,
    droughtSensitivity: 'Low-Moderate',
    optPhMin: 5.8,
    optPhMax: 7.8,
    preferredSoils: ['Nitisol', 'Loam', 'Cambisol'],
    nitrogenDemand: 'Moderate',
    isNitrogenFixer: false,
    rootDepth: 'Medium',
    residueCover: 'Moderate',
    forageValue: 'High',
    sourceUrl: 'https://www.fao.org/4/u3160e/u3160e04.htm'
  },
  {
    code: 'SORGHUM',
    nameEn: 'Sorghum',
    nameAm: 'ማሽላ (Mashila)',
    nameOm: 'Misingaa',
    scientificName: 'Sorghum bicolor (L.) Moench',
    family: 'Poaceae',
    durationMin: 120,
    durationMax: 130,
    waterNeedMin: 450,
    waterNeedMax: 650,
    kcAvg: 0.78,
    droughtSensitivity: 'Low',
    optPhMin: 5.5,
    optPhMax: 8.0,
    preferredSoils: ['Vertisol', 'Loam', 'SandyLoam', 'ClayLoam'],
    nitrogenDemand: 'Moderate',
    isNitrogenFixer: false,
    rootDepth: 'Deep',
    residueCover: 'High',
    forageValue: 'High',
    sourceUrl: 'https://www.fao.org/4/u3160e/u3160e04.htm'
  },
  {
    code: 'CHICKPEA',
    nameEn: 'Chickpea (Desi / Kabuli)',
    nameAm: 'ሽምብራ (Shimbra)',
    nameOm: 'Shumburaa',
    scientificName: 'Cicer arietinum L.',
    family: 'Fabaceae',
    durationMin: 95,
    durationMax: 125,
    waterNeedMin: 300,
    waterNeedMax: 500,
    kcAvg: 0.79,
    droughtSensitivity: 'Low-Moderate',
    optPhMin: 6.0,
    optPhMax: 8.0,
    preferredSoils: ['Vertisol', 'ClayLoam', 'Loam'],
    nitrogenDemand: 'Low',
    isNitrogenFixer: true,
    rootDepth: 'Deep',
    residueCover: 'Low',
    forageValue: 'Moderate',
    sourceUrl: 'https://www.fao.org/4/u3160e/u3160e04.htm'
  },
  {
    code: 'FABA_BEAN',
    nameEn: 'Faba Bean',
    nameAm: 'ባቄላ (Bakela)',
    nameOm: 'Baaqelaa',
    scientificName: 'Vicia faba L.',
    family: 'Fabaceae',
    durationMin: 110,
    durationMax: 145,
    waterNeedMin: 350,
    waterNeedMax: 500,
    kcAvg: 0.79,
    droughtSensitivity: 'Moderate',
    optPhMin: 5.8,
    optPhMax: 7.5,
    preferredSoils: ['Nitisol', 'Vertisol', 'Loam'],
    nitrogenDemand: 'Low',
    isNitrogenFixer: true,
    rootDepth: 'Medium',
    residueCover: 'Moderate',
    forageValue: 'Moderate',
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6083270/'
  },
  {
    code: 'FIELD_PEA',
    nameEn: 'Field Pea',
    nameAm: 'አተር (Ater)',
    nameOm: 'Atara',
    scientificName: 'Pisum sativum L.',
    family: 'Fabaceae',
    durationMin: 90,
    durationMax: 110,
    waterNeedMin: 300,
    waterNeedMax: 500,
    kcAvg: 0.79,
    droughtSensitivity: 'Moderate',
    optPhMin: 5.5,
    optPhMax: 7.5,
    preferredSoils: ['Nitisol', 'Loam', 'Cambisol'],
    nitrogenDemand: 'Low',
    isNitrogenFixer: true,
    rootDepth: 'Medium',
    residueCover: 'Moderate',
    forageValue: 'Moderate',
    sourceUrl: 'https://www.fao.org/4/u3160e/u3160e04.htm'
  },
  {
    code: 'LENTIL',
    nameEn: 'Lentil',
    nameAm: 'ምስር (Misir)',
    nameOm: 'Misira',
    scientificName: 'Lens culinaris Medik.',
    family: 'Fabaceae',
    durationMin: 95,
    durationMax: 150,
    waterNeedMin: 300,
    waterNeedMax: 450,
    kcAvg: 0.79,
    droughtSensitivity: 'Low-Moderate',
    optPhMin: 6.0,
    optPhMax: 8.0,
    preferredSoils: ['Vertisol', 'Loam', 'ClayLoam'],
    nitrogenDemand: 'Low',
    isNitrogenFixer: true,
    rootDepth: 'Shallow',
    residueCover: 'Low',
    forageValue: 'Moderate',
    sourceUrl: 'https://www.fao.org/4/u3160e/u3160e04.htm'
  }
];

export function analyzeCropRotationScenarios(
  input: RotationAnalyzeRequest,
  climatologyAnnualRainMm: number | null
) {
  const curCrop = DOCUMENTED_CROPS.find((c) => c.code === input.currentCropCode) || DOCUMENTED_CROPS[0];
  const prevCode = input.previousCropCodes[0] || 'WHEAT';
  const prevCrop = DOCUMENTED_CROPS.find((c) => c.code === prevCode) || DOCUMENTED_CROPS[2];
  const effectiveRainMm = climatologyAnnualRainMm ?? 850;
  const w = input.weights;

  function scoreCandidate(nextCrop: DocumentedCropSpec) {
    const sameFamily = nextCrop.family === curCrop.family;
    const repeatedCrop = nextCrop.code === curCrop.code;

    const waterScore =
      nextCrop.droughtSensitivity === 'Low'
        ? 92
        : nextCrop.droughtSensitivity === 'Low-Moderate'
        ? 85
        : nextCrop.droughtSensitivity === 'Moderate'
        ? 72
        : 54;

    const nitrogenScore = nextCrop.isNitrogenFixer
      ? curCrop.nitrogenDemand === 'High'
        ? 96
        : 90
      : sameFamily
      ? 40
      : 74;

    const soilScore =
      (nextCrop.isNitrogenFixer ? 35 : 16) +
      (nextCrop.rootDepth !== curCrop.rootDepth ? 32 : 14) +
      (input.soilType === 'unknown' || nextCrop.preferredSoils.includes(input.soilType) ? 30 : 15);

    const erosionScore =
      nextCrop.residueCover === 'High'
        ? 90
        : nextCrop.residueCover === 'Moderate'
        ? 76
        : input.slopePercent > 7
        ? 46
        : 65;

    const forageScore = nextCrop.forageValue === 'High' ? 92 : 74;
    const incomeScore = nextCrop.isNitrogenFixer ? 89 : 76;
    const riskScore = !sameFamily ? 91 : repeatedCrop ? 35 : 58;
    const foodScore = 85;

    const sumW =
      w.conservingWater +
      w.improvingSoilHealth +
      w.increasingNitrogen +
      w.reducingErosion +
      w.maintainingForage +
      w.improvingIncome +
      w.reducingCropFailure +
      w.maintainingFoodSecurity || 1;

    let total =
      (waterScore * w.conservingWater +
        soilScore * w.improvingSoilHealth +
        nitrogenScore * w.increasingNitrogen +
        erosionScore * w.reducingErosion +
        forageScore * w.maintainingForage +
        incomeScore * w.improvingIncome +
        riskScore * w.reducingCropFailure +
        foodScore * w.maintainingFoodSecurity) /
      sumW;

    if (repeatedCrop) total -= 14;
    if (input.waterRegime === 'rainfed' && effectiveRainMm < nextCrop.waterNeedMin) {
      total -= 18;
    }

    return {
      crop: nextCrop,
      totalScore: Number(Math.max(20, Math.min(98, total)).toFixed(1)),
      components: {
        water: waterScore,
        soil: soilScore,
        nitrogen: nitrogenScore,
        erosion: erosionScore,
        forage: forageScore,
        risk: riskScore
      }
    };
  }

  const soilHealthNext =
    curCrop.family === 'Poaceae'
      ? input.soilType === 'Vertisol'
        ? DOCUMENTED_CROPS.find((c) => c.code === 'CHICKPEA')!
        : DOCUMENTED_CROPS.find((c) => c.code === 'FABA_BEAN')!
      : DOCUMENTED_CROPS.find((c) => c.code === 'TEFF')!;

  const waterResilientNext =
    curCrop.code === 'SORGHUM'
      ? DOCUMENTED_CROPS.find((c) => c.code === 'CHICKPEA')!
      : DOCUMENTED_CROPS.find((c) => c.code === 'SORGHUM')!;

  const balancedNext =
    curCrop.code === 'FIELD_PEA'
      ? DOCUMENTED_CROPS.find((c) => c.code === 'BARLEY')!
      : DOCUMENTED_CROPS.find((c) => c.code === 'FIELD_PEA')!;

  return {
    nasaClimatologyAnnualRainMm: effectiveRainMm,
    scenarios: [
      {
        scenarioType: 'CURRENT_BASELINE',
        title: '1. Current / Baseline Rotation',
        sequence: [prevCrop.nameEn, curCrop.nameEn, curCrop.nameEn],
        evaluation: scoreCandidate(curCrop)
      },
      {
        scenarioType: 'SOIL_HEALTH',
        title: '2. Soil-Health & Nitrogen-Fixation Rotation',
        sequence: [prevCrop.nameEn, curCrop.nameEn, soilHealthNext.nameEn],
        evaluation: scoreCandidate(soilHealthNext)
      },
      {
        scenarioType: 'WATER_RESILIENCE',
        title: '3. Water-Resilience & Drought-Hedging Rotation',
        sequence: [prevCrop.nameEn, curCrop.nameEn, waterResilientNext.nameEn],
        evaluation: scoreCandidate(waterResilientNext)
      },
      {
        scenarioType: 'BALANCED_FOOD_FORAGE',
        title: '4. Short-Season Food & Forage Rotation',
        sequence: [prevCrop.nameEn, curCrop.nameEn, balancedNext.nameEn],
        evaluation: scoreCandidate(balancedNext)
      }
    ]
  };
}
