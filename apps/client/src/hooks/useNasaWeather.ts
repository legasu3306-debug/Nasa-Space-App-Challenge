import { useQuery } from '@tanstack/react-query';
import { fetchTelemetryBundle } from '../lib/api.js';
import { offlineDb } from '../lib/offlineDb.js';

export function useNasaWeather(farmId: string, latitude: number, longitude: number, isOffline: boolean) {
  const enabled = Boolean(farmId) && latitude !== 0 && longitude !== 0;

  return useQuery({
    queryKey: ['nasa-weather-telemetry', farmId, latitude, longitude, isOffline],
    enabled,
    queryFn: async () => {
      if (isOffline) {
        const cached = await offlineDb.telemetry.get(farmId);
        if (cached) return { ...cached.bundle, fromOfflineCache: true };
        throw new Error('Offline Mode active and no cached NASA snapshot exists for this farm.');
      }
      const bundle = await fetchTelemetryBundle(latitude, longitude);
      await offlineDb.telemetry.put({
        farmId,
        bundle,
        cachedAt: new Date().toISOString()
      });
      return { ...bundle, fromOfflineCache: false };
    },
    staleTime: 30 * 60 * 1000,
    retry: 1
  });
}
