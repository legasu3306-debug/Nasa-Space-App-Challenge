import { prisma } from '../lib/prisma.js';
import { CreateFarmInput, CreateFieldInput, CreateFieldObservationInput, UpdateFarmInput } from '@fieldshift/shared';

export async function listAllFarms() {
  return prisma.farm.findMany({
    include: { fields: { include: { soilProfile: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getFarmById(id: string) {
  return prisma.farm.findUnique({
    where: { id },
    include: { fields: { include: { soilProfile: true, cropHistory: true, fieldObservations: true } } }
  });
}

export async function createFarmRecord(input: CreateFarmInput) {
  return prisma.farm.create({
    data: {
      name: input.name,
      farmerName: input.farmerName,
      region: input.region,
      zone: input.zone,
      woreda: input.woreda,
      latitude: input.latitude,
      longitude: input.longitude,
      elevationMeters: input.elevationMeters,
      totalAreaHectares: input.totalAreaHectares,
      waterRegime: input.waterRegime,
      waterSources: input.waterSources,
      farmerPriorities: input.farmerPriorities
    }
  });
}

export async function updateFarmRecord(id: string, input: UpdateFarmInput) {
  return prisma.farm.update({
    where: { id },
    data: input
  });
}

export async function deleteFarmRecord(id: string) {
  return prisma.farm.delete({ where: { id } });
}

export async function createFieldRecord(input: CreateFieldInput) {
  return prisma.field.create({
    data: {
      farmId: input.farmId,
      name: input.name,
      areaHectares: input.areaHectares,
      slopePercent: input.slopePercent,
      currentCropCode: input.currentCropCode,
      previousCropCode: input.previousCropCode,
      plantingDate: input.plantingDate ? new Date(input.plantingDate) : null,
      expectedHarvestWindow: input.expectedHarvestWindow,
      primarySeason: input.primarySeason,
      soilProfile: {
        create: {
          soilType: input.soilType,
          soilPh: input.soilPh ?? null,
          organicMatterLevel: input.organicMatterLevel
        }
      }
    },
    include: { soilProfile: true }
  });
}

export async function recordFieldObservation(input: CreateFieldObservationInput) {
  return prisma.fieldObservation.create({
    data: {
      fieldId: input.fieldId,
      growthStage: input.growthStage,
      visualMaturityPct: input.visualMaturityPct,
      grainDrynessAssessment: input.grainDrynessAssessment,
      measuredGrainMoisture: input.measuredGrainMoisture ?? null,
      localRainGaugeMm: input.localRainGaugeMm ?? null,
      notes: input.notes,
      recordedOffline: input.recordedOffline
    }
  });
}
