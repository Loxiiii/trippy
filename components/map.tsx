'use client'

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";

const defaultMapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '15px 0px 0px 15px',
};

const defaultMapZoom = 8;

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
    return isHovered ? colorMap[category] : lightenColor(colorMap[category] || '#60a5fa', 20);
  };

  const getIcon = () => {
    if (category === null) {
      return `
        <text x="16" y="22" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${id}</text>
      `;
    }
    const iconMap: Record<string, string> = {
      food: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
      hike: 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7',
      shop: 'M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
      cultural_center: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z',
      museum: 'M22 11V9L12 2 2 9v2h2v9H2v2h20v-2h-2v-9h2zm-6 7h-4v-5h4v5z',
      nature_sight: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z',
      urban_sight: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z',
    };
    return `
      <path d="${iconMap[category] || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'}" fill="white" />
    `;
  };

  const size = category === null ? (isHovered ? 40 : 32) : (isHovered ? 24 : 20);
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${category === null ? '#000000' : getColor()}" />
      <g transform="translate(${size/2 - 12}, ${size/2 - 12}) scale(${category === null ? 1 : 0.75})">${getIcon()}</g>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const lightenColor = (color: string, amount: number): string => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, parseInt(color, 16) + amount).toString(16)).substr(-2));
};

export default function MapComponent({ stops, center, bounds, hoveredId, hoveredType }: { stops: any[], center: { lat: number, lng: number }, bounds: { north: number, south: number, east: number, west: number }, hoveredId: number | null, hoveredType: 'stop' | 'poi' | null }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const linesRef = useRef<{ [key: string]: google.maps.Polyline }>({});

  useEffect(() => {
    if (map) {
      const googleBounds = new window.google.maps.LatLngBounds();
      bounds.north && googleBounds.extend({ lat: bounds.north, lng: bounds.east });
      bounds.south && googleBounds.extend({ lat: bounds.south, lng: bounds.west });
      map.fitBounds(googleBounds);
    }
  }, [map, bounds]);

  useEffect(() => {
    if (map && hoveredId !== null) {
      const hoveredItem = [...stopCoordinates, ...poiCoordinates].find(item => item.id === hoveredId);
      if (hoveredItem) {
        const itemPosition = new google.maps.LatLng(hoveredItem.latitude, hoveredItem.longitude);
        if (!map.getBounds()?.contains(itemPosition)) {
          map.panTo(itemPosition);
        }
      }
    }
  }, [hoveredId, map]);

  useEffect(() => {
    Object.values(markersRef.current).forEach(marker => {
      const markerId = marker.get('id');
      const markerType = marker.get('type');
      const isHovered = hoveredId === markerId && hoveredType === markerType;
      marker.setIcon(createMarkerIcon(markerId, markerType === 'stop' ? null : markerType, isHovered));
      
      if (isHovered) {
        marker.setZIndex(1000);
        animateMarker(marker);
      } else {
        marker.setZIndex(undefined);
      }
    });
  }, [hoveredId, hoveredType]);

  const animateMarker = (marker: google.maps.Marker) => {
    let start: number | null = null;
    const duration = 300;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / duration;
      const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
      marker.setIcon({
        ...marker.getIcon() as google.maps.Icon,
        scaledSize: new google.maps.Size(32 * scale, 32 * scale),
      });
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const stopCoordinates = stops.map(stop => ({
    id: stop.id,
    latitude: stop.latitude,
    longitude: stop.longitude, 
    name: stop.name
  }));

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

  const getColorForCategory = (category: string) => {
    const colorMap: Record<string, string> = {
      food: '#f59e0b',
      hike: '#10b981',
      shop: '#3b82f6',
      cultural_center: '#8b5cf6',
      museum: '#64748b',
      nature_sight: '#22c55e',
      urban_sight: '#71717a',
    };
    return colorMap[category] || '#60a5fa';
  };

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
            key={`stop-${stop.id}`}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            icon={createMarkerIcon(stop.id, null, hoveredId === stop.id && hoveredType === 'stop')}
            title={stop.name}
            onLoad={(marker) => {
              marker.set('id', stop.id);
              marker.set('type', 'stop');
              markersRef.current[`stop-${stop.id}`] = marker;
            }}
          />
        ))}
        {poiCoordinates.map(poi => {
          const stopForPoi = stops.find(stop => stop.id === poi.stopId);
          return (
            <React.Fragment key={`poi-${poi.id}`}>
              <Marker
                position={{ lat: poi.latitude, lng: poi.longitude }}
                icon={createMarkerIcon(poi.id, poi.category, hoveredId === poi.id && hoveredType === 'poi')}
                title={poi.name}
                onLoad={(marker) => {
                  marker.set('id', poi.id);
                  marker.set('type', poi.category);
                  markersRef.current[`poi-${poi.id}`] = marker;
                }}
              />
              <Polyline
                path={[
                  { lat: stopForPoi.latitude, lng: stopForPoi.longitude },
                  { lat: poi.latitude, lng: poi.longitude }
                ]}
                options={{
                  strokeColor: getColorForCategory(poi.category),
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
                onLoad={(polyline) => {
                  linesRef.current[`poi-${poi.id}`] = polyline;
                }}
              />
            </React.Fragment>
          );
        })}
        <Polyline
          path={stopCoordinates.map(stop => ({ lat: stop.latitude, lng: stop.longitude }))}
          options={{
            strokeColor: "#000000",
            strokeOpacity: 1,
            strokeWeight: 3,
          }}
        />
      </GoogleMap>
    </div>
  );
}