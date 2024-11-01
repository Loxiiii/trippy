'use client'

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";

// Map's styling
const defaultMapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '15px 0px 0px 15px',
};

// Default zoom level, can be adjusted
const defaultMapZoom = 8;

// Map options
const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: 'greedy',
  mapTypeId: 'satellite',
  disableDefaultUI: true,
};

const createMarkerIcon = (id: number, category: string | null, isHovered: boolean) => {
  const getColor = () => {
    if (category === null) return isHovered ? "#000000" : "#333333";
    const colorMap: Record<string, string> = {
      food: '#f59e0b',
      hike: '#10b981',
      shop: '#3b82f6',
      cultural_center: '#8b5cf6',
      museum: '#64748b',
      nature_sight: '#22c55e',
      urban_sight: '#71717a',
    };
    return isHovered ? darkenColor(colorMap[category] || '#000000', 20) : colorMap[category] || '#000000';
  };

  const getIcon = () => {
    if (category === null) {
      return `
        <text x="20" y="25" font-size="20" font-weight="bold" text-anchor="middle" fill="white">${id}</text>
      `;
    }
    const iconMap: Record<string, string> = {
      food: 'M18.06 23l3.648-4h3.292l-5.21-5.748-3.774 4.143-11.106-12.208-1.8 1.635 12.975 14.283L18.06 23zm3.39-7.156c.315-.346.654-.658 1.033-.9C23.23 14.33 24.26 14 25.5 14c2.04 0 3.744 1.317 4.35 3.15l-2.265 2.49H24.21l-2.76 3.037v-6.833z',
      hike: 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 5.28c-1.2-.53-2.59-.8-4-.8-1.42 0-2.81.27-4.01.8-1.12.5-1.99 1.39-1.99 2.72v4c0 .55.45 1 1 1h2v7c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-7h2c.55 0 1-.45 1-1v-4c0-1.33-.87-2.22-1.99-2.72zM14 24h-1v-3h-1v3H9v-7H8v-4.39c.93-.34 1.95-.53 3-.54v.03h1v-.03c1.05.01 2.07.2 3 .54V17h-1v7z',
      shop: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
      cultural_center: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z',
      museum: 'M22 11V9L12 2 2 9v2h2v9H2v2h20v-2h-2v-9h2zm-6 7h-4v-5h4v5z',
      nature_sight: 'M14 6l-3.75 5 2.85  3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z',
      urban_sight: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z',
    };
    return `
      <path d="${iconMap[category] || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'}" fill="white" transform="translate(8,8)" />
    `;
  };

  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="${getColor()}" />
      ${getIcon()}
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Helper function to darken a color
const darkenColor = (color: string, amount: number): string => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.max(0, Math.min(255, parseInt(color, 16) - amount)).toString(16)).substr(-2));
};

export default function MapComponent({ stops, center, bounds, hoveredId, hoveredType }: { stops: any[], center: { lat: number, lng: number }, bounds: { north: number, south: number, east: number, west: number }, hoveredId: number | null, hoveredType: 'stop' | 'poi' | null }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (map) {
      const googleBounds = new window.google.maps.LatLngBounds();
      bounds.north && googleBounds.extend({ lat: bounds.north, lng: bounds.east });
      bounds.south && googleBounds.extend({ lat: bounds.south, lng: bounds.west });
      map.fitBounds(googleBounds);
    }
  }, [map, bounds]);

  // Extract stop coordinates
  const stopCoordinates = stops.map(stop => ({
    id: stop.id,
    latitude: stop.latitude,
    longitude: stop.longitude, 
    name: stop.name
  }));

  // Extract POI coordinates
  const extractPOIs = (stops) => {
    return stops.flatMap(stop =>
      stop.pois.map(poi => ({
        id: poi.id,
        name: poi.name,
        latitude: poi.latitude,
        longitude: poi.longitude,
        category: poi.category,
        stopId: stop.id
      }))
    );
  };
  
  const poiCoordinates = extractPOIs(stops);

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={center}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
        onLoad={(map) => {
          mapRef.current = map;
          setMap(map);
        }}
      >
        {stopCoordinates.map(stop => (
          <Marker
            key={stop.id}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            icon={createMarkerIcon(stop.id, null, hoveredId === stop.id && hoveredType === 'stop')}
            title={stop.name}
          />
        ))}
        {poiCoordinates.map(poi => (
          <Marker
            key={poi.id}
            position={{ lat: poi.latitude, lng: poi.longitude }}
            icon={createMarkerIcon(poi.id, poi.category, hoveredId === poi.id && hoveredType === 'poi')}
            title={poi.name}
          />
        ))}
        <Polyline
          path={stopCoordinates.map(stop => ({ lat: stop.latitude, lng: stop.longitude }))}
          options={{
            strokeColor: "#000000",
            strokeOpacity: 1,
            strokeWeight: 3,
          }}
        />
        {stops.map(stop => (
          <Polyline
            key={stop.id}
            path={stop.pois
              .filter(poi => poi.latitude !== null && poi.longitude !== null)
              .map(poi => ({ lat: poi.latitude, lng: poi.longitude }))
            }
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}