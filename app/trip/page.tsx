'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TripPageComponent() {
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [hoveredStop, setHoveredStop] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const expandedMapRef = useRef<HTMLDivElement>(null)

  const toggleMap = () => setIsMapExpanded(!isMapExpanded)

  useEffect(() => {
    if (isMapExpanded && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (isMapExpanded && expandedMapRef.current && !expandedMapRef.current.contains(event.target as Node)) {
        setIsMapExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMapExpanded])

  const stops = [
    "Calgary - Starting Point",
    "Banff National Park",
    "Lake Louise",
    "Icefields Parkway",
    "Jasper National Park",
    "Mount Robson Provincial Park",
    "Yoho National Park",
    "Calgary - End Point"
  ]

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Amazing Adventure in the Rockies</h1>
        <p className="text-lg text-muted-foreground">
          Embark on a 7-day journey through the breathtaking Canadian Rockies, 
          exploring pristine lakes, majestic mountains, and diverse wildlife.
        </p>
      </header>

      <section ref={sectionRef} className="mb-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 border border-slate-400 rounded-md p-5">
            <h2 className="text-2xl font-semibold mb-4">Itinerary Stops</h2>
            <ol className="space-y-2">
              {stops.map((stop, index) => (
                <li 
                  key={index}
                  className="p-2 rounded transition-colors duration-200 ease-in-out cursor-pointer hover:bg-accent"
                  onMouseEnter={() => setHoveredStop(index)}
                  onMouseLeave={() => setHoveredStop(null)}
                >
                  <span className="font-semibold mr-2">{index + 1}.</span> {stop}
                </li>
              ))}
            </ol>
          </div>
          <div ref={mapRef} className="relative aspect-square md:aspect-auto">
            <Card className="h-full border border-slate-400 rounded-md p-5">
              <CardContent className="p-0 relative h-full">
                <img
                  src="/placeholder.svg?height=400&width=400&text=Rocky+Mountains+Map"
                  alt="Rocky Mountains Trip Map"
                  className="w-full h-full object-cover"
                />
                {stops.map((_, index) => (
                  <div
                    key={index}
                    className={`absolute w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold ${
                      hoveredStop === index ? 'bg-primary text-primary-foreground' : 'bg-background text-primary'
                    }`}
                    style={{
                      top: `${10 + (index * 10)}%`,
                      left: `${10 + (index * 10)}%`,
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={toggleMap}
            >
              {isMapExpanded ? <X className="h-4 w-4" /> : 'Expand'}
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
            <p>Share your thoughts about this amazing Rocky Mountain adventure!</p>
          </CardContent>
        </Card>
      </section>

      {isMapExpanded && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center overflow-auto p-8">
          <div 
            ref={expandedMapRef}
            className="bg-background rounded-lg shadow-xl border-2 border-gray-200 m-4"
            style={{
              width: sectionRef.current ? `${sectionRef.current.offsetWidth - 32}px` : 'calc(100% - 2rem)',
              maxWidth: 'calc(90vw - 2rem)',
              maxHeight: 'calc(80vh - 2rem)'
            }}
          >
            <Card className="w-full h-full">
              <CardContent className="p-0 relative h-full">
                <img
                  src="/placeholder.svg?height=800&width=1200&text=Expanded+Rocky+Mountains+Map"
                  alt="Expanded Rocky Mountains Trip Map"
                  className="w-full h-full object-cover"
                />
                {stops.map((_, index) => (
                  <div
                    key={index}
                    className={`absolute w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold ${
                      hoveredStop === index ? 'bg-primary text-primary-foreground' : 'bg-background text-primary'
                    }`}
                    style={{
                      top: `${10 + (index * 10)}%`,
                      left: `${10 + (index * 10)}%`,
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={toggleMap}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}