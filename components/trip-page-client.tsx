'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Map, Heart, MessageCircle, Share2, Utensils, Footprints, ShoppingBag, Landmark, Building2, Mountain, Building, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { MapComponent } from "@/components/map"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ... (previous type definitions remain unchanged)

const getCategoryIcon = (category: PointOfInterest['category']) => {
  // ... (previous implementation remains unchanged)
};

export function TripPageClientComponent({ 
  tripImages = [], 
  mapImageUrl = '', 
  stops = [], 
  comments = [],
  pois = []
}: TripPageClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [selectedPOIPhotos, setSelectedPOIPhotos] = useState<{
    poiId: number;
    photos: string[];
    selectedIndex: number;
  } | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [hoveredType, setHoveredType] = useState<'stop' | 'poi' | null>(null);

  // ... (previous functions remain unchanged)

  const handleHover = (id: number, type: 'stop' | 'poi') => {
    setHoveredId(id);
    setHoveredType(type);
  };

  const handleHoverEnd = () => {
    setHoveredId(null);
    setHoveredType(null);
  };

  // ... (rest of the component logic remains unchanged)

  return (
    <TooltipProvider>
      <>
        {/* ... (Trip Photos section remains unchanged) */}

        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="h-full">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Itinerary</h2>
                <Accordion type="single" collapsible className="w-full">
                  {stops.map((stop) => {
                    const groupedPOIs = groupPOIsByCategory(stop.pois);
                    return (
                      <AccordionItem key={stop.id} 
                                     value={`stop-${stop.id}`}
                                     onMouseEnter={() => handleHover(stop.id, 'stop')}
                                     onMouseLeave={handleHoverEnd}
                                     className="transition-colors duration-300">
                        <AccordionTrigger className="hover:no-underline hover:bg-muted/50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                              {stop.id}
                            </span>
                            <div className="text-left">
                              <h3 className="font-semibold">{stop.name}</h3>
                              <p className="text-sm text-muted-foreground">{stop.nights} {stop.nights === 1 ? 'night' : 'nights'}</p>
                              <p className="text-sm text-muted-foreground mt-1">{stop.description}</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 pl-11">
                            <Accordion type="multiple" className="w-full">
                              {Object.entries(groupedPOIs).map(([category, pois]) => {
                                if (pois.length === 0) return null;
                                const { icon, className, hoverClass, label } = getCategoryIcon(category as PointOfInterest['category']);
                                return (
                                  <AccordionItem key={category} value={`${stop.id}-${category}`}>
                                    <AccordionTrigger className={`hover:no-underline rounded-md transition-colors ${hoverClass}`}>
                                      <div className="flex items-center space-x-2">
                                        <span className={`inline-flex w-6 h-6 items-center justify-center ${className} text-white rounded-full`}>
                                          {icon}
                                        </span>
                                        <span>{label}</span>
                                        <span className="text-sm text-muted-foreground">({pois.length})</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      {pois.map((poi) => (
                                        <Tooltip key={poi.id}>
                                          <TooltipTrigger asChild>
                                            <div 
                                              className={`mb-4 last:mb-0 flex items-start rounded-md p-2 transition-colors ${hoverClass} cursor-pointer`}
                                              onMouseEnter={() => handleHover(poi.id, 'poi')}
                                              onMouseLeave={handleHoverEnd}
                                            >
                                              <div className="flex-grow">
                                                <h5 className="font-medium mb-1">{poi.name}</h5>
                                                <p className="text-sm text-muted-foreground mb-2">{poi.description}</p>
                                              </div>
                                              {poi.photos && poi.photos.length > 0 && (
                                                <div 
                                                  className="relative w-20 h-20 flex-shrink-0 cursor-pointer ml-4"
                                                  onClick={() => openPOIPhotos(poi.id, poi.photos)}
                                                >
                                                  {poi.photos.slice(0, 3).map((photo, photoIndex) => (
                                                    <div
                                                      key={photoIndex}
                                                      className="absolute border-2 border-background rounded-xl overflow-hidden transition-transform hover:scale-105"
                                                      style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        top: `${photoIndex * 4}px`,
                                                        left: `${photoIndex * 4}px`,
                                                        zIndex: 3 - photoIndex,
                                                        transform: photoIndex === 0 ? 'rotate(-5deg)' : photoIndex === 1 ? 'rotate(0deg)' : 'rotate(5deg)',
                                                      }}
                                                    >
                                                      <Image
                                                        src={photo}
                                                        alt={`${poi.name} photo ${photoIndex + 1}`}
                                                        fill
                                                        className="object-cover"
                                                      />
                                                    </div>
                                                  ))}
                                                  {poi.photos.length > 3 && (
                                                    <div className="absolute bottom-0 right-0 bg-background text-foreground px-1 rounded-md text-xs font-medium">
                                                      +{poi.photos.length - 3}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent side="right" sideOffset={5}>
                                            <p>{poi.name}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      ))}
                                    </AccordionContent>
                                  </AccordionItem>
                                );
                              })}
                            </Accordion>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
            <Card className="aspect-square overflow-hidden">
              <CardContent className="p-0 h-full relative">
                <div className="w-full h-full">
                  <MapComponent 
                    stops={stops} 
                    center={mapProps.center} 
                    bounds={mapProps.bounds}
                    hoveredId={hoveredId}
                    hoveredType={hoveredType}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ... (Comments section and Dialogs remain unchanged) */}
      </>
    </TooltipProvider>
  )
}