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
import MapComponent from "@/components/map"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Stop = {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  nights: number;
  trip_id: number;
  trip_stop_number: number;
  pois: PointOfInterest[];
};

type User = {
  name: string;
  avatarUrl: string;
  username: string;
};

type Comment = {
  id: number;
  profile: User;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
};

type PointOfInterest = {
  id: number;
  stop_id: number;
  trip_id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  photos: string[];
  category: 'food' | 'hike' | 'shop' | 'cultural_center' | 'museum' | 'nature_sight' | 'urban_sight';
};

type TripPageClientProps = {
  tripImages: string[];
  mapImageUrl: string;
  stops: Stop[];
  comments: Comment[];
  pois: PointOfInterest[];
};

const getCategoryIcon = (category: PointOfInterest['category']) => {
  const iconMap: Record<PointOfInterest['category'], { icon: JSX.Element, className: string, hoverClass: string, label: string }> = {
    food: {
      icon: <Utensils className="h-4 w-4" />,
      className: "bg-orange-500",
      hoverClass: "hover:bg-orange-100",
      label: "Food"
    },
    hike: {
      icon: <Footprints className="h-4 w-4" />,
      className: "bg-green-500",
      hoverClass: "hover:bg-green-100",
      label: "Hike"
    },
    shop: {
      icon: <ShoppingBag className="h-4 w-4" />,
      className: "bg-blue-500",
      hoverClass: "hover:bg-blue-100",
      label: "Shop"
    },
    cultural_center: {
      icon: <Landmark className="h-4 w-4" />,
      className: "bg-pink-500",
      hoverClass: "hover:bg-pink-100",
      label: "Cultural Center"
    },
    museum: {
      icon: <Building2 className="h-4 w-4" />,
      className: "bg-purple-500",
      hoverClass: "hover:bg-purple-100",
      label: "Museum"
    },
    nature_sight: {
      icon: <Mountain className="h-4 w-4" />,
      className: "bg-yellow-500",
      hoverClass: "hover:bg-yellow-100",
      label: "Nature Sight"
    },
    urban_sight: {
      icon: <Building className="h-4 w-4" />,
      className: "bg-cyan-500",
      hoverClass: "hover:bg-cyan-100",
      label: "Urban Sight"
    },
  };

  return iconMap[category] || { icon: null, className: "bg-primary", hoverClass: "hover:bg-primary-100", label: "Other" };
};

export default function TripPageClient({
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

  const openImageModal = (index: number) => setSelectedImageIndex(index)
  const closeImageModal = () => setSelectedImageIndex(null)

  const nextImage = () => {
    if (selectedImageIndex !== null && tripImages.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % tripImages.length)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex !== null && tripImages.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + tripImages.length) % tripImages.length)
    }
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(carouselRef.current?.scrollLeft || 0)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const openPOIPhotos = (poiId: number, photos: string[], initialIndex: number = 0) => {
    setSelectedPOIPhotos({ poiId, photos, selectedIndex: initialIndex });
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
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const groupPOIsByCategory = (pois: PointOfInterest[]) => {
    return pois.reduce((acc, poi) => {
      if (!acc[poi.category]) {
        acc[poi.category] = [];
      }
      acc[poi.category].push(poi);
      return acc;
    }, {} as Record<PointOfInterest['category'], PointOfInterest[]>);
  };

  const calculateMapProps = () => {
    const lats = stops.map(stop => stop.latitude);
    const lngs = stops.map(stop => stop.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      center: {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2
      },
      bounds: {
        north: maxLat,
        south: minLat,
        east: maxLng,
        west: minLng
      }
    };
  };

  const mapProps = calculateMapProps();

  const handleHover = (id: number, type: 'stop' | 'poi') => {
    setHoveredId(id);
    setHoveredType(type);
  };

  const handleHoverEnd = () => {
    setHoveredId(null);
    setHoveredType(null);
  };

  useEffect(() => {
    if (hoveredId !== null && hoveredType !== null) {
      const itemElement = document.querySelector(`[data-${hoveredType}-id="${hoveredId}"]`);
      if (itemElement) {
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        itemElement.classList.add('bg-primary/10', 'transition-colors', 'duration-300');
      }
      return () => {
        if (itemElement) {
          itemElement.classList.remove('bg-primary/10', 'transition-colors', 'duration-300');
        }
      };
    }
  }, [hoveredId, hoveredType]);

  return (
    <TooltipProvider>
      <>
        <section className="mb-8 relative">
          <h2 className="text-2xl font-semibold mb-4">Trip Photos</h2>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
              onClick={() => scrollCarousel('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10"
              onClick={() => scrollCarousel('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div
              ref={carouselRef}
              className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory no-scrollbar"
              style={{ scrollBehavior: 'smooth', cursor: isDragging ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
            >
              {tripImages.map((image, index) => (
                <Card key={index} className="flex-none w-48 h-48 cursor-pointer snap-center" onClick={() => openImageModal(index)}>
                  <CardContent className="p-0 relative w-full h-full">
                    <Image
                      src={image}
                      alt={`Trip photo ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

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
                                     className="transition-colors duration-300"
                                     data-stop-id={stop.id}
                      >
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
                                        <span className="text-sm  text-muted-foreground">({pois.length})</span>
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
                                              data-poi-id={poi.id}
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

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {comments.map((comment) => (
                  <li key={comment.id}>
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={comment.profile.avatarUrl} alt={comment.profile.name} />
                        <AvatarFallback>{comment.profile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{comment.profile.name}</h3>
                          <span className="text-sm text-muted-foreground">{comment.profile.username}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Heart className="h-4 w-4 mr-2" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {comment.replies}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Load more comments</Button>
            </CardFooter>
          </Card>
        </section>

        <Dialog open={selectedImageIndex !== null} onOpenChange={closeImageModal}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
            <div className="relative w-full h-[90vh]">
              {selectedImageIndex !== null && tripImages[selectedImageIndex] && (
                <>
                  <div className="absolute inset-0">
                    <Image
                      src={tripImages[selectedImageIndex]}
                      alt={`Trip photo ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                      priority
                    />
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={closeImageModal}
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute inset-y-0 left-2 flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevImage}
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextImage}
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
                      {stops.find(stop => stop.pois?.some(poi => poi.id === selectedPOIPhotos.poiId))?.pois?.find(poi => poi.id === selectedPOIPhotos.poiId)?.name}
                    </h3>
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={closePOIPhotos}
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
      </>
    </TooltipProvider>
  )
}