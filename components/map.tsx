'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GoogleMap, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'

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
  mapTypeId: 'roadmap',
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
      // Stop marker with centered number
      const size = isHovered ? 40 : 32;
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
          <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="white" filter="url(#shadow)"/>
          <circle cx="${size/2}" cy="${size/2}" r="${size/2-4}" fill="${getColor()}"/>
          <text
            x="${size/2}"
            y="${size/2}"
            font-family="Arial, sans-serif"
            font-size="${size/2}"
            font-weight="bold"
            fill="white"
            text-anchor="middle"
            dominant-baseline="central"
          >${id}</text>
        </svg>
      `;
    }

    // POI marker with icon
    const size = isHovered ? 32 : 24;
    const iconSize = size * 0.5;
    const iconMap: Record<string, string> = {
      food: 'M12,2A3,3,0,0,0,9,5V8H7V5A3,3,0,0,0,1,5V8A3,3,0,0,0,4,11V22H8V11A3,3,0,0,0,11,8V5A3,3,0,0,0,12,2M16,2A3,3,0,0,0,13,5V8H15V5A1,1,0,0,1,17,5V8H19V5A3,3,0,0,0,16,2M22,19H14V22H22V19Z',
      hike: 'M13.5,5.5C14.59,5.5 15.5,4.58 15.5,3.5C15.5,2.38 14.59,1.5 13.5,1.5C12.39,1.5 11.5,2.38 11.5,3.5C11.5,4.58 12.39,5.5 13.5,5.5M9.8,8.9L7,23H9.1L10.9,15L13,17V23H15V15.5L12.9,13.5L13.5,10.5C14.8,12 16.8,13 19,13V11C17.1,11 15.5,10 14.7,8.6L13.7,7C13.3,6.4 12.7,6 12,6C11.7,6 11.5,6.1 11.2,6.1L6,8.3V13H8V9.6L9.8,8.9M13,1.5',
      shop: 'M19 6H17C17 3.2 14.8 1 12 1S7 3.2 7 6H5C3.9 6 3 6.9 3 8V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V8C21 6.9 20.1 6 19 6M12 3C13.7 3 15 4.3 15 6H9C9 4.3 10.3 3 12 3M19 20H5V8H19V20M12 12C10.3 12 9 10.7 9 9H7C7 11.8 9.2 14 12 14S17 11.8 17 9H15C15 10.7 13.7 12 12 12Z',
      cultural_center: 'M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z',
      museum: 'M12,0L3,5V7H21V5M5,9V21H8V9M10,9V21H14V9M16,9V21H19V9',
      nature_sight: 'M14,6L10.25,11L13.1,14.8L11.5,16C9.81,13.75 7,10 7,10L1,18H23L14,6Z',
      urban_sight: 'M15,11V5L12,2L9,5V7H3V21H21V11H15M7,19H5V17H7V19M7,15H5V13H7V15M7,11H5V9H7V11M13,19H11V17H13V19M13,15H11V13H13V15M13,11H11V9H13V11M13,7H11V5H13V7M19,19H17V17H19V19M19,15H17V13H19V15Z',
    };

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="white" filter="url(#shadow)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2-4}" fill="${getColor()}"/>
        <g transform="translate(${(size-iconSize)/2}, ${(size-iconSize)/2}) scale(${iconSize/24})">
          <path d="${iconMap[category]}" fill="white"/>
        </g>
      </svg>
    `;
  };

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(getIcon())}`;
};

const lightenColor = (color: string, amount: number): string => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, parseInt(color, 16) + amount).toString(16)).substr(-2));
};

export default function MapComponent({ stops, center, bounds, hoveredId, hoveredType }: { stops: any[], center: { lat: number, lng: number }, bounds: { north: number, south: number, east: number, west: number }, hoveredId: number | null, hoveredType: 'stop' | 'poi' | null }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const linesRef = useRef<{ [key: string]: google.maps.Polyline }>({});
  const [hoveredPOI, setHoveredPOI] = useState<any | null>(null);
  const [isPOILocked, setIsPOILocked] = useState(false);
  const [selectedPOIPhotos, setSelectedPOIPhotos] = useState<{
    poiId: number;
    photos: string[];
    selectedIndex: number;
  } | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        stopId: stop.id,
        photos: poi.photos
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

  const openPOIPhotos = (poiId: number, photos: string[], initialIndex: number = 0) => {
    setSelectedPOIPhotos({ poiId, photos, selectedIndex: initialIndex });
    setHoveredPOI(null);
    setIsPOILocked(false);
  };

  const closePOIPhotos = () => {
    setSelectedPOIPhotos(null);
  };

  const nextPOIPhoto = () => {
    if (selectedPOIPhotos && selectedPOIPhotos.photos.length > 0) {
      setSelectedPOIPhotos({
        ...selectedPOIPhotos,
        selectedIndex: (selectedPOIPhotos.selectedIndex + 1) % selectedPOIPhotos.photos.length
      });
    }
  };

  const prevPOIPhoto = () => {
    if (selectedPOIPhotos && selectedPOIPhotos.photos.length > 0) {
      setSelectedPOIPhotos({
        ...selectedPOIPhotos,
        selectedIndex: (selectedPOIPhotos.selectedIndex - 1 + selectedPOIPhotos.photos.length) % selectedPOIPhotos.photos.length
      });
    }
  };

  useEffect(() => {
    const handleMapClick = () => {
      if (isPOILocked) {
        setHoveredPOI(null);
        setIsPOILocked(false);
      }
    };

    if (map) {
      map.addListener('click', handleMapClick);
    }

    return () => {
      if (map) {
        google.maps.event.clearListeners(map, 'click');
      }
    };
  }, [map, isPOILocked]);

  const handlePoiMouseOver = (poi: any) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    if (!isPOILocked) {
      setHoveredPOI(poi);
    }
  };

  const handlePoiMouseOut = () => {
    if (!isPOILocked) {
      closeTimeoutRef.current = setTimeout(() => {

        setHoveredPOI(null);
      }, 1500);
    }
  };

  useEffect(() => {
    if (map && hoveredPOI) {
      const point = new google.maps.LatLng(hoveredPOI.latitude, hoveredPOI.longitude);
      const bounds = map.getBounds();
      if (bounds && !bounds.contains(point)) {
        map.panTo(point);
      }
    }
  }, [map, hoveredPOI]);

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
                onMouseOver={() => handlePoiMouseOver(poi)}
                onMouseOut={handlePoiMouseOut}
                onClick={() => {
                  if (hoveredPOI && hoveredPOI.id === poi.id) {
                    setIsPOILocked(!isPOILocked);
                  } else {
                    setHoveredPOI(poi);
                    setIsPOILocked(true);
                  }
                }}
              />
              <Polyline
                path={[
                  { lat: stopForPoi.latitude, lng: stopForPoi.longitude },
                  { lat: poi.latitude, lng: poi.longitude }
                ]}
                options={{
                  strokeColor: getColorForCategory(poi.category),
                  strokeOpacity: 0.5,
                  strokeWeight: 1.5,
                  icons: [{
                    icon: {
                      path: 'M 0,-1 0,1',
                      strokeOpacity: 1,
                      scale: 3
                    },
                    offset: '0',
                    repeat: '10px'
                  }]
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
        {hoveredPOI && (
          <InfoWindow
            position={{ lat: hoveredPOI.latitude, lng: hoveredPOI.longitude }}
            options={{
              pixelOffset: new window.google.maps.Size(0, -20),
              disableAutoPan: false,
              maxWidth: 128,
              closeBoxURL: '',
            }}
            onMouseOver={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
              }
            }}
            onMouseOut={handlePoiMouseOut}
          >
            <Card className="w-32 shadow-none border-none">
              <CardHeader className="p-2 pb-0 text-center">
                <CardTitle className="text-sm font-semibold truncate">{hoveredPOI.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div
                  className="relative w-full aspect-square rounded-md overflow-hidden cursor-pointer group"
                  onClick={() => openPOIPhotos(hoveredPOI.id, hoveredPOI.photos)}
                >
                  {hoveredPOI.photos.length > 0 ? (
                    <>
                      <Image
                        src={hoveredPOI.photos[0]}
                        alt={`${hoveredPOI.name} main photo`}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  {hoveredPOI.photos.length > 1 && (
                    <div className="absolute bottom-1 right-1 bg-background/80 backdrop-blur-sm px-1 py-0.5 rounded-full text-[10px] font-medium">
                      +{hoveredPOI.photos.length - 1}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>

      <Dialog open={selectedPOIPhotos !== null} onOpenChange={closePOIPhotos}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative w-full h-[90vh]">
            {selectedPOIPhotos && selectedPOIPhotos.photos[selectedPOIPhotos.selectedIndex] && (
              <>
                <div className="absolute inset-0">
                  <Image
                    src={selectedPOIPhotos.photos[selectedPOIPhotos.selectedIndex]}
                    alt={`POI photo ${selectedPOIPhotos.selectedIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                    priority
                  />
                </div>
                <div className="absolute top-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {poiCoordinates.find(poi => poi.id === selectedPOIPhotos.poiId)?.name}
                  </h3>
                </div>
                {selectedPOIPhotos.photos.length > 1 && (
                  <>
                    <div className="absolute inset-y-0 left-2 flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevPOIPhoto}
                        className="bg-background/80 backdrop-blur-sm"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextPOIPhoto}
                        className="bg-background/80 backdrop-blur-sm"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {selectedPOIPhotos.selectedIndex + 1} / {selectedPOIPhotos.photos.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}