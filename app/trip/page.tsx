import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import TripPageClient from './trip-page-client'

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

type TripPageProps = {
  title: string;
  description: string;
  headerImageUrl: string;
  tripImages: string[];
  mapImageUrl: string;
  stops: Stop[];
  user: User;
  comments: Comment[];
};

export default function TripPage({ 
  title = "Eurotrip Adventure 2023", 
  description = "An unforgettable journey through the heart of Europe, exploring iconic cities and hidden gems.",
  headerImageUrl = "/header.jpg",
  tripImages = [
    "/trip-image-1.jpg",
    "/trip-image-2.jpg",
    "/trip-image-3.jpg",
    "/trip-image-4.jpg",
    "/trip-image-5.jpg",
    "/trip-image-6.jpg",
    "/trip-image-7.jpg",
    "/trip-image-8.jpg",
  ],
  mapImageUrl = "/your-map-image.jpg",
  stops = [
    { id: 1, name: "Paris", description: "City of Lights", coordinates: { x: 48.8566, y: 2.3522 }, nights: 3 },
    { id: 2, name: "Rome", description: "Eternal City", coordinates: { x: 41.9028, y: 12.4964 }, nights: 4 },
    { id: 3, name: "Barcelona", description: "Gaudi's Playground", coordinates: { x: 41.3851, y: 2.1734 }, nights: 3 },
    { id: 4, name: "Amsterdam", description: "Venice of the North", coordinates: { x: 52.3676, y: 4.9041 }, nights: 2 },
  ],
  user = {
    name: "Emily Traveler",
    avatarUrl: "/Emily.jpg",
    username: "@worldexplorer",
  },
  comments = [
    {
      id: 1,
      user: { name: "Alex Adventure", avatarUrl: "/alex-avatar.jpg", username: "@alexadventure" },
      content: "This trip looks amazing! I've been to Paris and it's absolutely stunning. Can't wait to see more of your photos!",
      likes: 15,
      replies: 2,
      timestamp: "2h ago"
    },
    {
      id: 2,
      user: { name: "Sarah Nomad", avatarUrl: "/sarah-avatar.jpg", username: "@sarahnomad" },
      content: "Barcelona is my favorite city! Make sure to visit La Sagrada Familia, it's breathtaking.",
      likes: 8,
      replies: 1,
      timestamp: "1h ago"
    },
    {
      id: 3,
      user: { name: "Mike Backpacker", avatarUrl: "/mike-avatar.jpg", username: "@mikebackpacker" },
      content: "Great itinerary! How are you traveling between cities? Train or flights?",
      likes: 5,
      replies: 3,
      timestamp: "30m ago"
    }
  ]
}: TripPageProps) {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 relative">
        <div className="relative w-full h-[300px] mb-16 overflow-hidden rounded-lg">
          <Image
            src={headerImageUrl}
            alt="Trip header"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute left-4 bottom-0 transform translate-y-1/2">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="mt-1 text-lg text-muted-foreground">
              <span className="font-semibold">{user.name}</span> • <span>{user.username}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <Card className="h-full">
          <CardContent className="prose max-w-none p-6">
            <p>{description}</p>
          </CardContent>
        </Card>
      </section>

      <TripPageClient 
        tripImages={tripImages}
        mapImageUrl={mapImageUrl}
        stops={stops}
        comments={comments}
      />
    </div>
  )
}