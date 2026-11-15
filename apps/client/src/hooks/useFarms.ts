import { useState, useEffect } from 'react';
import type { FarmProfileRecord } from '../lib/offlineDb.js';
import { fetchFarms, createFarmRecord } from '../lib/api.js';

export function useFarms() {
  const [farms, setFarms] = useState<FarmProfileRecord[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const serverFarms = await fetchFarms();
        if (!cancelled) {
          setFarms(serverFarms);
          if (serverFarms.length > 0 && selectedFarmId === null) {
            setSelectedFarmId(serverFarms[0].id);
          }
        }
      } catch {
        // Fall back to localStorage if the backend is unreachable
        try {
          const saved = localStorage.getItem('fieldshift_farms_v2');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0 && !cancelled) {
              setFarms(parsed);
              if (selectedFarmId === null) setSelectedFarmId(parsed[0].id);
            }
          }
        } catch {
          // ignore storage errors
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? undefined;

  function addOrUpdateFarm(record: FarmProfileRecord) {
    createFarmRecord(record).then((created) => {
      setFarms((prev) => {
        const exists = prev.some((f) => f.id === record.id);
        const next = exists ? prev.map((f) => (f.id === record.id ? created : f)) : [...prev, created];
        try {
          localStorage.setItem('fieldshift_farms_v2', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      setSelectedFarmId(created.id);
    }).catch(() => {
      // Fall back to localStorage only
      setFarms((prev) => {
        const exists = prev.some((f) => f.id === record.id);
        const next = exists ? prev.map((f) => (f.id === record.id ? record : f)) : [...prev, record];
        try {
          localStorage.setItem('fieldshift_farms_v2', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      setSelectedFarmId(record.id);
    });
  }

  return {
    farms,
    selectedFarm,
    selectedFarmId,
    setSelectedFarmId,
    addOrUpdateFarm,
    loading
  };
}
