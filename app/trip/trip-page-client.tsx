'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Map, Heart, MessageCircle, Share2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Stop = {
  id: number;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
  nights: number;
};

type User = {
  name: string;
  avatarUrl: string;
  username: string;
};

type Comment = {
  id: number;
  user: User;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
};

type TripPageClientProps = {
  tripImages: string[];
  mapImageUrl: string;
  stops: Stop[];
  comments: Comment[];
};

export default function TripPageClient({ tripImages, mapImageUrl, stops, comments }: TripPageClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [hoveredStop, setHoveredStop] = useState<Stop | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const openImageModal = (index: number) => setSelectedImageIndex(index)
  const closeImageModal = () => setSelectedImageIndex(null)
  const openMapModal = () => setIsMapModalOpen(true)
  const closeMapModal = () => setIsMapModalOpen(false)

  const nextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % tripImages.length)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex !== null) {
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
    setStartX(e.pageX - carouselRef.current!.offsetLeft)
    setScrollLeft(carouselRef.current!.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current!.offsetLeft
    const walk = (x - startX) * 2
    carouselRef.current!.scrollLeft = scrollLeft - walk
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  return (
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
              <ul className="space-y-4">
                {stops.map((stop) => (
                  <li 
                    key={stop.id}
                    className="rounded transition-colors duration-200 ease-in-out hover:bg-accent/50"
                    onMouseEnter={() => setHoveredStop(stop)}
                    onMouseLeave={() => setHoveredStop(null)}
                  >
                    <div className="flex items-start p-2">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full mr-3">
                        {stop.id}
                      </span>
                      <div>
                        <h3 className="font-semibold">{stop.name}</h3>
                        <p className="text-sm text-muted-foreground">{stop.description}</p>
                        <p className="text-sm font-medium mt-1">{stop.nights} {stop.nights === 1 ? 'night' : 'nights'}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="relative">
            <Card className="aspect-square cursor-pointer" onClick={openMapModal}>
              <CardContent className="p-0 h-full relative">
                <Image
                  src={mapImageUrl}
                  alt="Trip Map"
                  fill
                  className="object-cover rounded-lg"
                />
                {stops.map((stop) => (
                  <div
                    key={stop.id}
                    className={`absolute w-6 h-6 rounded-full border-2 border-primary transition-all duration-200 ease-in-out flex items-center justify-center text-xs font-bold ${
                      hoveredStop?.id === stop.id ? 'bg-primary text-primary-foreground scale-125' : 'bg-background text-primary'
                    }`}
                    style={{
                      left: `${stop.coordinates.y}%`,
                      top: `${stop.coordinates.x}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {stop.id}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2 z-10"
              onClick={openMapModal}
            >
              <Map className="h-4 w-4 mr-2" />
              Expand Map
            </Button>
          </div>
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
                      <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{comment.user.name}</h3>
                        <span className="text-sm text-muted-foreground">{comment.user.username}</span>
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
            {selectedImageIndex !== null && (
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

      <Dialog open={isMapModalOpen} onOpenChange={closeMapModal}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-2 z-10"
            onClick={closeMapModal}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={mapImageUrl}
              alt="Trip Map"
              fill
              className="object-contain"
            />
            {stops.map((stop) => (
              <div
                key={stop.id}
                className={`absolute w-6 h-6 rounded-full border-2 border-primary transition-all duration-200 ease-in-out flex items-center justify-center text-xs font-bold ${
                  hoveredStop?.id === stop.id ? 'bg-primary text-primary-foreground scale-125' : 'bg-background text-primary'
                }`}
                style={{
                  left: `${stop.coordinates.y}%`,
                  top: `${stop.coordinates.x}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {stop.id}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}