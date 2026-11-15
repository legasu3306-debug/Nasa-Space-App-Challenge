import Dexie, { type Table } from 'dexie';
import type { LiveTelemetryBundle } from './api.js';

export interface FarmProfileRecord {
  id: string;
  name: string;
  farmerName: string;
  region: string;
  zone: string;
  woreda: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  totalAreaHectares: number;
  slopePercent: number;
  soilType: string;
  soilPh: number | null;
  waterRegime: 'rainfed' | 'irrigated' | 'supplementary';
  currentCropCode: string;
  previousCropCode: string;
  plantingDate: string;
}

export interface CachedTelemetryRecord {
  farmId: string;
  bundle: LiveTelemetryBundle;
  cachedAt: string;
}

export interface QueuedFieldObservationRecord {
  id?: number;
  farmId: string;
  farmName: string;
  cropCode: string;
  growthStage: string;
  grainDryness: string;
  measuredMoisturePct: number | null;
  createdAt: string;
  synced: boolean;
}

export class FieldShiftOfflineDatabase extends Dexie {
  farms!: Table<FarmProfileRecord, string>;
  telemetry!: Table<CachedTelemetryRecord, string>;
  observations!: Table<QueuedFieldObservationRecord, number>;

  constructor() {
    super('FieldShiftEthiopiaDB_v2');
    this.version(1).stores({
      farms: 'id, region, woreda',
      telemetry: 'farmId, cachedAt',
      observations: '++id, farmId, synced, createdAt'
    });
  }
}

export const offlineDb = new FieldShiftOfflineDatabase();
