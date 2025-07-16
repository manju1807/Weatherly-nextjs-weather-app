import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface DynamicMapProps {
  center: [number, number];
  zoom: number;
  markerPosition: [number, number];
  popupContent: string;
}

const DynamicMap: React.FC<DynamicMapProps> = ({
  center,
  zoom,
  markerPosition,
  popupContent,
}) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Clean up map instance on unmount
    const mapInstance = mapRef.current;
    return () => {
      if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
      }
    };
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="border rounded-md z-0"
        ref={mapRef}
        key={`${center[0]}-${center[1]}-${zoom}`}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={markerPosition}>
          <Popup>{popupContent}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DynamicMap;
