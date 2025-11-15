import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const FALLBACK_POSITION = [-7.330, 110.500];

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
const MapUpdater = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: locations.length === 1 ? 14 : undefined
      });
    }
  }, [map, locations]);

  return null;
};

const MapComponent = ({ data }) => {

  const center = useMemo(() => {
    if (data && data.length > 0) {
      const avgLat = data.reduce((sum, loc) => sum + loc.lat, 0) / data.length;
      const avgLng = data.reduce((sum, loc) => sum + loc.lng, 0) / data.length;
      return [avgLat, avgLng];
    }
    return FALLBACK_POSITION;
  }, [data]);
  const handleNavigationClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ borderRadius: "12px", overflow: "hidden", height: "100%", width: "100%", minHeight: "300px" }}>
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "300px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater locations={data} />

        {data.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{location.label}</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>{location.description}.</p>

                {location.url && (
                  <button
                    onClick={() => handleNavigationClick(location.url)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: '#007bff',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    Lihat di Google Maps &rarr;
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapComponent);