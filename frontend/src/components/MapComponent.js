import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const FALLBACK_POSITION = [-7.330, 110.500];

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


const getIconColor = (pendingTickets, completedTickets) => {
  if (pendingTickets > 0) {
    return 'yellow';
  }
  if (completedTickets > 0) {
    return 'green';
  }
  return 'blue';
};

const createCustomIcon = (color, pendingCount) => {

  const backgroundColor = color === 'yellow' ? '#f0ad4e' : 
    color === 'green' ? '#5cb85c' : 
      '#3388ff'; 
  const labelText = pendingCount > 0 ? pendingCount : '';
  const pulseClass = color === 'yellow' ? 'marker-pulse' : '';

  const iconHtml = `
    <div class="${pulseClass}" style="
      background-color: ${backgroundColor}; 
      width: 25px; 
      height: 25px; 
      border-radius: 50%; 
      border: 3px solid #fff; 
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
      text-align: center;
      line-height: 19px; 
      color: white;
      font-weight: bold;
      font-size: 11px;
    ">
      ${labelText}
    </div>
  `;

  return L.divIcon({
    className: 'custom-div-icon',
    html: iconHtml,
    iconSize: [25, 25],
    iconAnchor: [12.5, 25], 
    popupAnchor: [0, -15], 
  });
};


const MapComponent = ({ data, onStatClick }) => {

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

  const createPopupContent = (location) => {
    const completedHtml = `<p 
      class="custom-popup-stat" 
      style="color: #5cb85c;" 
      onclick="window.handleMapStatClick(${location.id}, 'Selesai')"
      >&#9679; Selesai: ${location.completed_tickets ?? 0}</p>`;
      
    const pendingHtml = `<p 
      class="custom-popup-stat" 
      style="color: #f0ad4e;" 
      onclick="window.handleMapStatClick(${location.id}, 'Belum Selesai')"
      >&#9679; Pending: ${location.pending_tickets ?? 0}</p>`;
      
    const totalHtml = `<p 
      class="custom-popup-stat" 
      style="color: #3388ff;" 
      onclick="window.handleMapStatClick(${location.id}, 'all')"
      >&#9679; Total: ${location.total_tickets ?? 0}</p>`;

    return `
      <div class="custom-popup-content" style="min-width: 150px; padding: 5px;">
        <h4>${location.label}</h4>
        <p style="font-size: 14px; color: #555;">${location.description}</p>

        <div style="font-size: 14px; border-top: 1px solid #eee; padding-top: 8px;">
          ${completedHtml}
          ${pendingHtml}
          ${totalHtml}
        </div>

        ${location.url ? `
          <button
            onclick="window.handleMapNavClick('${location.url}')"
            style="padding: 8px 12px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 4px; width: 100%;"
          >
            Lihat di Google Maps &rarr;
          </button>
        ` : ''}
      </div>
    `;
  };

  useEffect(() => {
    window.handleMapStatClick = (workshopId, status) => {
      if (onStatClick) {
        onStatClick(workshopId, status);
      }
    };
    window.handleMapNavClick = handleNavigationClick;

    return () => {
      delete window.handleMapStatClick;
      delete window.handleMapNavClick;
    };
  }, [onStatClick]);


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

        {data.map((location, index) => {
          const color = getIconColor(location.pending_tickets, location.completed_tickets);
          const customIcon = createCustomIcon(color, location.pending_tickets);
          const popupContent = createPopupContent(location);

          return (
            <Marker
              key={index}
              position={[location.lat, location.lng]}
              icon={customIcon}
            >
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: popupContent }} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapComponent);