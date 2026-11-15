import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface EthiopiaFarmMapProps {
  latitude: number;
  longitude: number;
  farmName: string;
  onSelectCoordinates?: (lat: number, lon: number) => void;
}

const ETHIOPIA_CENTER = [8.75, 38.98];

export const EthiopiaFarmMap: React.FC<EthiopiaFarmMapProps> = ({
  latitude,
  longitude,
  farmName,
  onSelectCoordinates
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Leaflet CSS dynamically if not already loaded
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([latitude, longitude], 8);

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors'
        }
      ).addTo(mapRef.current);

      markerRef.current = L.marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(`<strong>${farmName}</strong><br>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`)
        .openPopup();

      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        const lat = Number(e.latlng.lat.toFixed(4));
        const lon = Number(e.latlng.lng.toFixed(4));
        markerRef.current?.setLatLng([lat, lon]);
        markerRef.current?.bindPopup(
          `<strong>${farmName}</strong><br>${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`
        ).openPopup();
        onSelectCoordinates?.(lat, lon);
      });
    } else {
      mapRef.current.setView([latitude, longitude], 8);
      markerRef.current?.setLatLng([latitude, longitude]);
      markerRef.current?.bindPopup(
        `<strong>${farmName}</strong><br>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`
      ).openPopup();
    }
  }, [latitude, longitude, farmName, onSelectCoordinates]);

  return (
    <div ref={containerRef} className="w-full h-80 rounded-xl border border-[#E2E8E0] bg-[#F7F8F2]" />
  );
};
