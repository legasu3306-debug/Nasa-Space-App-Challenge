declare namespace google {
  namespace maps {
    class Map {
      constructor(
        div: HTMLElement,
        opts?: MapOptions
      );
      setCenter(latLng: LatLngLiteral | LatLng): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }
    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLngLiteral | LatLng): void;
      setTitle(title: string): void;
      getPosition(): LatLng | null;
      addListener(eventName: string, handler: Function): MapsEventListener;
      setMap(map: Map | null): void;
    }
    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map: Map, anchor?: MVCObject): void;
      setContent(content: string | Node): void;
    }
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    interface MapOptions {
      center?: LatLngLiteral | LatLng;
      zoom?: number;
      mapTypeId?: MapTypeId;
      restriction?: MapRestriction;
      fullscreenControl?: boolean;
      streetViewControl?: boolean;
    }
    interface MarkerOptions {
      position?: LatLngLiteral | LatLng;
      map?: Map;
      title?: string;
      draggable?: boolean;
    }
    interface InfoWindowOptions {
      content?: string | Node;
    }
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    interface MapRestriction {
      latLngBounds: LatLngBoundsLiteral;
      strictBounds?: boolean;
    }
    interface LatLngBoundsLiteral {
      north: number;
      south: number;
      west: number;
      east: number;
    }
    type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
    interface MapsEventListener {
      remove(): void;
    }
    interface MouseEvent {
      latLng: LatLng | null;
    }
    interface MVCObject {}
  }
}

declare global {
  interface Window {
    google: typeof google.maps;
  }
}
