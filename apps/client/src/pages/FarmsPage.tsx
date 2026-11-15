import React, { useState, useEffect } from 'react';
import type { LiveTelemetryBundle } from '../lib/api.js';
import type { FarmProfileRecord } from '../lib/offlineDb.js';
import { MetricCard } from '../components/ui/MetricCard.js';
import { EthiopiaFarmMap } from '../components/map/EthiopiaFarmMap.js';
import { useFarms } from '../hooks/useFarms.js';
import { createFarmRecord } from '../lib/api.js';

interface PageProps {
  farm: FarmProfileRecord;
  telemetry?: LiveTelemetryBundle;
  isLoading: boolean;
}

export const FarmsPage: React.FC<PageProps> = ({ farm, telemetry, isLoading }) => {
  const { farms, loading: farmsLoading } = useFarms();
  const [newFarm, setNewFarm] = useState<Partial<FarmProfileRecord>>({
    latitude: 8.75,
    longitude: 38.98,
    waterRegime: 'rainfed',
    currentCropCode: 'TEFF',
    previousCropCode: 'WHEAT',
    totalAreaHectares: 1.0,
    slopePercent: 2.5,
    elevationMeters: 1850
  });
  const [mapCenter, setMapCenter] = useState({ lat: 8.75, lon: 38.98 });
  const [creating, setCreating] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  useEffect(() => {
    setMapCenter({ lat: newFarm.latitude ?? 8.75, lon: newFarm.longitude ?? 38.98 });
  }, [newFarm.latitude, newFarm.longitude]);

  const handleMapClick = async (lat: number, lon: number) => {
    setNewFarm((prev) => ({ ...prev, latitude: lat, longitude: lon }));
    setMapCenter({ lat, lon });

    // Reverse geocode to auto-fill region/woreda from coordinates
    setReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        setNewFarm((prev) => ({
          ...prev,
          region: addr.state || addr.region || prev.region || '',
          woreda: addr.county || addr.municipality || addr.suburb || prev.woreda || '',
          zone: addr.state_district || prev.zone || ''
        }));
      }
    } catch {
      // ignore reverse geocoding failures
    } finally {
      setReverseGeocoding(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarm.name || !newFarm.farmerName || !newFarm.region || !newFarm.zone || !newFarm.woreda || newFarm.latitude === undefined || newFarm.longitude === undefined) {
      alert('Please fill all required fields.');
      return;
    }
    setCreating(true);
    try {
      await createFarmRecord({
        name: newFarm.name,
        farmerName: newFarm.farmerName,
        region: newFarm.region,
        zone: newFarm.zone,
        woreda: newFarm.woreda,
        latitude: newFarm.latitude,
        longitude: newFarm.longitude,
        elevationMeters: newFarm.elevationMeters ?? 1850,
        totalAreaHectares: newFarm.totalAreaHectares ?? 1.0,
        slopePercent: newFarm.slopePercent ?? 2.5,
        soilType: newFarm.soilType ?? 'unknown',
        soilPh: newFarm.soilPh ?? null,
        waterRegime: newFarm.waterRegime as FarmProfileRecord['waterRegime'],
        currentCropCode: newFarm.currentCropCode as FarmProfileRecord['currentCropCode'],
        previousCropCode: newFarm.previousCropCode ?? 'WHEAT',
        plantingDate: newFarm.plantingDate ?? ''
      });
      window.location.reload();
    } catch (err) {
      alert('Failed to save farm to server: ' + (err instanceof Error ? err.message : String(err)));
      setCreating(false);
    }
  };

  const obs = telemetry?.observations || [];
  const latest = obs[obs.length - 1];
  const imergGranules = telemetry?.cmrGranulesByProduct?.GPM_3IMERGDL || [];
  const smapGranules = telemetry?.cmrGranulesByProduct?.SPL3SMP_E || [];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8E0] p-5 space-y-4 shadow-sm">
      {/* Farm Creation Form */}
      <div className="bg-[#F7F8F2] rounded-xl border border-[#E2E8E0] p-4 space-y-3">
        <h3 className="font-bold text-sm text-[#202B24]">Register New Farm</h3>
        <p className="text-xs text-[#748077]">
          Click anywhere on the map below to auto-fill coordinates and location details.
        </p>

        {/* Map */}
        <div className="mb-3">
          <EthiopiaFarmMap
            latitude={mapCenter.lat}
            longitude={mapCenter.lon}
            farmName={newFarm.name ?? 'Selected Point'}
            onSelectCoordinates={handleMapClick}
          />
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-[#202B24] mb-1">Farm Name</label>
            <input
              name="name"
              value={newFarm.name ?? ''}
              onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
              placeholder="e.g. Ada'a / Bishoftu Cluster"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Farmer / DA Name</label>
            <input
              name="farmerName"
              value={newFarm.farmerName ?? ''}
              onChange={(e) => setNewFarm({ ...newFarm, farmerName: e.target.value })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
              placeholder="e.g. Bekele Tadesse"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Region</label>
            <input
              name="region"
              value={newFarm.region ?? ''}
              onChange={(e) => setNewFarm({ ...newFarm, region: e.target.value })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
              placeholder="e.g. Oromia"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Zone</label>
            <input
              name="zone"
              value={newFarm.zone ?? ''}
              onChange={(e) => setNewFarm({ ...newFarm, zone: e.target.value })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
              placeholder="e.g. East Shewa"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Woreda</label>
            <input
              name="woreda"
              value={newFarm.woreda ?? ''}
              onChange={(e) => setNewFarm({ ...newFarm, woreda: e.target.value })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
              placeholder="e.g. Ada'a (Debre Zeit)"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Latitude (°N)</label>
            <input
              name="latitude"
              type="number"
              step="0.0001"
              value={newFarm.latitude ?? ''}
              onChange={(e) => setNewFarm({ ...newFarm, latitude: Number(e.target.value) })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
              placeholder="e.g. 8.75"
              min="3" max="15.5"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Longitude (°E)</label>
            <input
              name="longitude"
              type="number"
              step="0.0001"
              value={newFarm.longitude ?? ''}
              onChange={(e) => setNewFarm({ ...newFarm, longitude: Number(e.target.value) })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
              placeholder="e.g. 38.98"
              min="33" max="48.5"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Area (hectares)</label>
            <input
              name="totalAreaHectares"
              type="number"
              step="0.1"
              value={newFarm.totalAreaHectares ?? ''}
              onChange={(e) => setNewFarm({ ...newFarm, totalAreaHectares: Number(e.target.value) })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
              placeholder="e.g. 1.5"
              min="0.1" max="10000"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Current Crop</label>
            <select
              name="currentCropCode"
              value={newFarm.currentCropCode ?? 'TEFF'}
              onChange={(e) => setNewFarm({ ...newFarm, currentCropCode: e.target.value as FarmProfileRecord['currentCropCode'] })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
            >
              <option value="TEFF">Teff</option>
              <option value="MAIZE">Maize</option>
              <option value="WHEAT">Wheat</option>
              <option value="BARLEY">Barley</option>
              <option value="SORGHUM">Sorghum</option>
              <option value="CHICKPEA">Chickpea</option>
              <option value="FABA_BEAN">Faba Bean</option>
              <option value="FIELD_PEA">Field Pea</option>
              <option value="LENTIL">Lentil</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202B24] mb-1">Water Regime</label>
            <select
              name="waterRegime"
              value={newFarm.waterRegime ?? 'rainfed'}
              onChange={(e) => setNewFarm({ ...newFarm, waterRegime: e.target.value as FarmProfileRecord['waterRegime'] })}
              className="w-full px-2 py-1.5 rounded border border-[#E2E8E0] bg-white text-sm"
            >
              <option value="rainfed">Rainfed</option>
              <option value="irrigated">Irrigated</option>
              <option value="supplementary">Supplementary</option>
            </select>
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full py-1.5 rounded-lg text-xs font-semibold bg-[#245B3C] text-white disabled:bg-[#748077]"
            >
              {creating ? 'Saving…' : 'Save Farm to Server'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Farms List */}
      {!farmsLoading && farms.length > 0 && (
        <div className="border-t border-[#E2E8E0] pt-4">
          <h3 className="font-bold text-sm text-[#202B24] mb-2">Existing Farms</h3>
          <ul className="space-y-1">
            {farms.map((f) => (
              <li key={f.id} className="text-xs flex justify-between items-center p-1.5 rounded hover:bg-[#E8F0E9]">
                <span className="text-[#202B24]">{f.name} — {f.woreda}, {f.region}</span>
                <span className="text-[#748077] font-mono">{f.latitude.toFixed(4)}°N, {f.longitude.toFixed(4)}°E</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Farm Telemetry */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#245B3C]">
          {farm.name} ({farm.woreda}, {farm.region})
        </span>
        <h1 className="text-xl font-bold text-[#202B24] mt-0.5">Farm & Field Profile Management</h1>
        <p className="text-xs sm:text-sm text-[#748077]">Register smallholder farms, select coordinates on the interactive Ethiopian map, and record soil & crop history.</p>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-sm text-[#748077]">
          Querying live NASA POWER, NASA CMR Granule Search, and NASA GLDAS/NLDAS endpoints…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Latest NASA Precip"
            value={latest?.precipMm !== null && latest?.precipMm !== undefined ? `${latest.precipMm} mm` : 'Unavailable'}
            subtitle={latest?.date || 'NASA POWER PRECTOTCORR'}
            sourceBadge="NASA POWER"
          />
          <MetricCard
            label="30-Yr Annual Climatology"
            value={telemetry?.climatologyAnnualRainMm ? `${telemetry.climatologyAnnualRainMm} mm/yr` : 'Unavailable'}
            subtitle="NASA POWER AG Climatology"
            sourceBadge="NASA CLIM"
          />
          <MetricCard
            label="GPM IMERG V07B Pass"
            value={imergGranules[0]?.timeStart ? imergGranules[0].timeStart.slice(0, 10) : 'CMR Ready'}
            subtitle={imergGranules[0]?.title || 'GPM_3IMERGDL 0.1°'}
            sourceBadge="NASA CMR"
          />
          <MetricCard
            label="SMAP 9km Soil Pass"
            value={smapGranules[0]?.timeStart ? smapGranules[0].timeStart.slice(0, 10) : 'CMR Ready'}
            subtitle={smapGranules[0]?.title || 'SPL3SMP_E 9km'}
            sourceBadge="NASA SMAP"
          />
        </div>
      )}
    </div>
  );
};
