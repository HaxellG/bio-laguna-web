import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Zone } from '../../models';

// Fix default marker icon for bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  zones: Zone[];
  devices?: import('../../models').Device[];
}

function FitBounds({ validDevices, zones }: { validDevices: import('../../models').Device[], zones: Zone[] }) {
  const map = useMap();

  useEffect(() => {
    if (validDevices.length > 0) {
      const bounds = L.latLngBounds(validDevices.map((d) => [d.lat!, d.lng!]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1.5 });
      }
    } else if (zones.length > 0) {
      const bounds = L.latLngBounds(zones.map((z) => [z.lat, z.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1.5 });
      }
    }
  }, [validDevices.length, zones.length, map]);

  return null;
}

export default function ZoneMap({ zones, devices = [] }: Props) {
  const validDevices = devices.filter((d) => d.lat !== undefined && d.lng !== undefined && d.lat !== null && d.lng !== null);

  const center: [number, number] =
    validDevices.length > 0
      ? [
          validDevices.reduce((s, d) => s + (d.lat || 0), 0) / validDevices.length,
          validDevices.reduce((s, d) => s + (d.lng || 0), 0) / validDevices.length,
        ]
      : zones.length > 0
      ? [
          zones.reduce((s, z) => s + z.lat, 0) / zones.length,
          zones.reduce((s, z) => s + z.lng, 0) / zones.length,
        ]
      : [4.711, -74.072];

  return (
    <MapContainer
      center={center}
      zoom={5} // El FitBounds sobreescribirá este valor automáticamente cuando carguen los datos
      scrollWheelZoom={false}
      zoomControl={false}
      className="w-full h-64 rounded-xl z-0"
    >
      <FitBounds validDevices={validDevices} zones={zones} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      
      {validDevices.length > 0
        ? validDevices.map((d) => (
            <Marker key={d.code} position={[d.lat!, d.lng!]}>
              <Popup>
                <div className="text-center">
                  <strong className="block text-primary-600 mb-1">{d.code}</strong>
                  <span className="text-xs text-gray-500">Nodo Activo</span>
                </div>
              </Popup>
            </Marker>
          ))
        : zones.map((zone) => (
            <Marker key={zone.id} position={[zone.lat, zone.lng]}>
              <Popup>
                <strong>{zone.name}</strong>
                <br />
                {zone.deviceCount} devices active
              </Popup>
            </Marker>
          ))}
    </MapContainer>
  );
}
