import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapDevice, Zone } from '../../models';

// Fix default marker icon for bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom buoy icon
const buoyIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedBuoyIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: 'selected-buoy-marker',
});

interface Props {
  zones: Zone[];
  mapDevices?: MapDevice[];
  selectedDeviceId?: string | null;
  onDeviceClick?: (deviceId: string) => void;
}

function FitBounds({ mapDevices, zones }: { mapDevices: MapDevice[]; zones: Zone[] }) {
  const map = useMap();

  useEffect(() => {
    if (mapDevices.length > 0) {
      const bounds = L.latLngBounds(mapDevices.map((d) => [d.lat, d.lon]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1.5 });
      }
    } else if (zones.length > 0) {
      const bounds = L.latLngBounds(zones.map((z) => [z.lat, z.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1.5 });
      }
    }
  }, [mapDevices.length, zones.length, map]);

  return null;
}

export default function ZoneMap({ zones, mapDevices = [], selectedDeviceId, onDeviceClick }: Props) {
  const center: [number, number] = useMemo(() => {
    if (mapDevices.length > 0) {
      return [
        mapDevices.reduce((s, d) => s + d.lat, 0) / mapDevices.length,
        mapDevices.reduce((s, d) => s + d.lon, 0) / mapDevices.length,
      ];
    }
    if (zones.length > 0) {
      return [
        zones.reduce((s, z) => s + z.lat, 0) / zones.length,
        zones.reduce((s, z) => s + z.lng, 0) / zones.length,
      ];
    }
    return [4.711, -74.072];
  }, [mapDevices, zones]);

  return (
    <MapContainer
      center={center}
      zoom={5}
      scrollWheelZoom={false}
      zoomControl={false}
      className="w-full h-80 sm:h-96 rounded-xl z-0"
    >
      <FitBounds mapDevices={mapDevices} zones={zones} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      
      {mapDevices.length > 0
        ? mapDevices.map((d) => {
            const isSelected = selectedDeviceId === d.device_id;
            return (
              <Marker
                key={d.device_id}
                position={[d.lat, d.lon]}
                icon={isSelected ? selectedBuoyIcon : buoyIcon}
                eventHandlers={{
                  click: () => onDeviceClick?.(d.device_id),
                }}
              >
                <Popup>
                  <div style={{ padding: '14px 16px', minWidth: 170 }}>
                    {/* Header stripe */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      <span
                        className="material-icons-round"
                        style={{ fontSize: '20px', color: '#4a8fe3' }}
                      >
                        sensors
                      </span>
                      <div>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1e293b',
                          lineHeight: '1.2',
                        }}>
                          {d.device_id}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '11px',
                          color: '#94a3b8',
                          fontWeight: 500,
                        }}>
                          Nodo Activo
                        </p>
                      </div>
                    </div>
                    {/* Coordinates */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '12px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lat</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#475569', fontWeight: 600, fontFamily: 'monospace' }}>{d.lat.toFixed(5)}</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lon</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#475569', fontWeight: 600, fontFamily: 'monospace' }}>{d.lon.toFixed(5)}</p>
                      </div>
                    </div>
                    {/* CTA Button */}
                    <button
                      onClick={() => onDeviceClick?.(d.device_id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#ffffff',
                        background: isSelected
                          ? 'linear-gradient(135deg, #2b6ec7 0%, #4a8fe3 100%)'
                          : 'linear-gradient(135deg, #4a8fe3 0%, #5599e8 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="material-icons-round" style={{ fontSize: '14px' }}>
                        {isSelected ? 'visibility' : 'touch_app'}
                      </span>
                      {isSelected ? 'Seleccionado' : 'Ver lecturas'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })
        : zones.map((zone) => (
            <Marker key={zone.id} position={[zone.lat, zone.lng]}>
              <Popup>
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{zone.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{zone.deviceCount} dispositivos activos</p>
                </div>
              </Popup>
            </Marker>
          ))}
    </MapContainer>
  );
}
