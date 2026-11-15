-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EXTENSION_AGENT',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "woreda" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "farmerName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "woreda" TEXT NOT NULL,
    "latitude" DECIMAL(8,5) NOT NULL,
    "longitude" DECIMAL(8,5) NOT NULL,
    "elevationMeters" INTEGER NOT NULL DEFAULT 1850,
    "totalAreaHectares" DECIMAL(6,2) NOT NULL,
    "waterRegime" TEXT NOT NULL DEFAULT 'rainfed',
    "waterSources" TEXT[],
    "farmerPriorities" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Field" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaHectares" DECIMAL(6,2) NOT NULL,
    "slopePercent" DECIMAL(4,1) NOT NULL DEFAULT 2.5,
    "currentCropCode" TEXT,
    "previousCropCode" TEXT,
    "plantingDate" TIMESTAMP(3),
    "expectedHarvestWindow" TEXT,
    "primarySeason" TEXT NOT NULL DEFAULT 'Kiremt',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilProfile" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "soilType" TEXT NOT NULL DEFAULT 'unknown',
    "soilPh" DECIMAL(3,1),
    "organicMatterLevel" TEXT NOT NULL DEFAULT 'unknown',
    "drainageClass" TEXT NOT NULL DEFAULT 'unknown',
    "depthClass" TEXT NOT NULL DEFAULT 'unknown',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SoilProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropHistory" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "cropCode" TEXT NOT NULL,
    "residueKept" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CropHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherObservation" (
    "id" TEXT NOT NULL,
    "latitude" DECIMAL(8,5) NOT NULL,
    "longitude" DECIMAL(8,5) NOT NULL,
    "observationDate" DATE NOT NULL,
    "provider" TEXT NOT NULL,
    "productIdentifier" TEXT NOT NULL,
    "productVersion" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "spatialResolution" TEXT NOT NULL,
    "precipMm" DECIMAL(6,2),
    "tempMeanC" DECIMAL(5,2),
    "tempMaxC" DECIMAL(5,2),
    "tempMinC" DECIMAL(5,2),
    "relHumidityPct" DECIMAL(5,2),
    "windSpeed2mMs" DECIMAL(5,2),
    "solarRadKwhM2" DECIMAL(5,2),
    "surfaceSoilWetness" DECIMAL(4,3),
    "rootSoilWetness" DECIMAL(4,3),
    "ndvi" DECIMAL(4,3),
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeatherObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherForecast" (
    "id" TEXT NOT NULL,
    "latitude" DECIMAL(8,5) NOT NULL,
    "longitude" DECIMAL(8,5) NOT NULL,
    "forecastTimestamp" TIMESTAMP(3) NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'OPEN_METEO_NON_NASA',
    "modelIdentifier" TEXT NOT NULL DEFAULT 'ECMWF_IFS_GFS_BLEND',
    "precipProbPct" DECIMAL(5,2),
    "precipAmountMm" DECIMAL(6,2),
    "temp2mC" DECIMAL(5,2),
    "relHumidity2mPct" DECIMAL(5,2),
    "windSpeed10mMs" DECIMAL(5,2),
    "windGusts10mMs" DECIMAL(5,2),
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeatherForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "moduleType" TEXT NOT NULL,
    "decisionState" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "evidenceJson" JSONB NOT NULL,
    "dataSourcesUsed" TEXT[],
    "missingInfo" TEXT[],
    "risks" TEXT[],
    "suggestedActions" TEXT[],
    "confidenceLevel" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RotationScenario" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cropSequenceCodes" TEXT[],
    "totalScore" DECIMAL(5,2) NOT NULL,
    "componentScoresJson" JSONB NOT NULL,
    "priorityWeightsJson" JSONB NOT NULL,
    "advantages" TEXT[],
    "disadvantages" TEXT[],
    "dataGaps" TEXT[],
    "assumptions" TEXT[],
    "rankingRationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RotationScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldObservation" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "growthStage" TEXT NOT NULL,
    "visualMaturityPct" INTEGER,
    "grainDrynessAssessment" TEXT NOT NULL,
    "measuredGrainMoisture" DECIMAL(4,1),
    "localRainGaugeMm" DECIMAL(5,1),
    "notes" TEXT,
    "recordedOffline" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FieldObservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Farm_region_woreda_idx" ON "Farm"("region", "woreda");
CREATE INDEX "Farm_latitude_longitude_idx" ON "Farm"("latitude", "longitude");
CREATE INDEX "Field_farmId_idx" ON "Field"("farmId");
CREATE UNIQUE INDEX "SoilProfile_fieldId_key" ON "SoilProfile"("fieldId");
CREATE INDEX "CropHistory_fieldId_year_idx" ON "CropHistory"("fieldId", "year");
CREATE UNIQUE INDEX "WeatherObservation_latitude_longitude_observationDate_provi_key" ON "WeatherObservation"("latitude", "longitude", "observationDate", "provider", "productIdentifier");
CREATE INDEX "WeatherObservation_latitude_longitude_observationDate_idx" ON "WeatherObservation"("latitude", "longitude", "observationDate");
CREATE UNIQUE INDEX "WeatherForecast_latitude_longitude_forecastTimestamp_provid_key" ON "WeatherForecast"("latitude", "longitude", "forecastTimestamp", "provider");
CREATE INDEX "WeatherForecast_latitude_longitude_forecastTimestamp_idx" ON "WeatherForecast"("latitude", "longitude", "forecastTimestamp");
CREATE INDEX "Recommendation_fieldId_moduleType_generatedAt_idx" ON "Recommendation"("fieldId", "moduleType", "generatedAt");
CREATE INDEX "RotationScenario_fieldId_createdAt_idx" ON "RotationScenario"("fieldId", "createdAt");
CREATE INDEX "FieldObservation_fieldId_observedAt_idx" ON "FieldObservation"("fieldId", "observedAt");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Field" ADD CONSTRAINT "Field_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SoilProfile" ADD CONSTRAINT "SoilProfile_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CropHistory" ADD CONSTRAINT "CropHistory_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RotationScenario" ADD CONSTRAINT "RotationScenario_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FieldObservation" ADD CONSTRAINT "FieldObservation_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
