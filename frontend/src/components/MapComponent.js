import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix untuk marker default Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ data }) => {
  // Koordinat pusat peta default
  const defaultPosition = [-7.330, 110.500]; // Contoh: Koordinat Jawa Tengah

  const handleMarkerClick = (url) => {
    // Membuka URL di tab baru
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ borderRadius: "12px", overflow: "hidden", height: "100%", width: "100%", minHeight: "300px" }}>
    <MapContainer 
      center={defaultPosition} 
      zoom={10} 
      scrollWheelZoom={false} 
      style={{ height: "100%", width: "100%", minHeight: "300px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {data.map((location, index) => (
        <Marker 
          key={index} 
          position={[location.lat, location.lng]}
          // Tambahkan event onClick di sini
          eventHandlers={{
            click: () => {
              if (location.url) {
                handleMarkerClick(location.url);
              }
            },
          }}
        >
          <Popup>
            <strong>{location.label}</strong> <br /> 
            {location.description}.
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </div>
  );
};

export default React.memo(MapComponent);
