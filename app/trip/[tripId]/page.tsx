import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import TripPageClient from './trip-page-client'
import { Trip, Stop, User, TripComment, TripPageProps} from '@/utils/types'
import { getTripById } from '@/utils/controllers/tripController'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabaseClient';


export default async function TripPage(props) {
  const params = await props.params;

  const {
    tripImages = [
      "/photo1.jpg",
      "/photo2.jpg",
      "/photo3.jpg",
      "/photo4.jpg",
      "/photo5.jpg",
      "/photo6.jpg",
      "/photo7.jpg",
    ],

    mapImageUrl = "/map.jpg",

    stops = [
      { id: 1, name: "Two Medicine Area", description: "Moody lodge under the trees", latitude: 48.8566, longitude: 2.3522, nights: 3 },
      { id: 2, name: "Many Glacier", description: "Abundant glaciers year round", latitude: 41.9028, longitude: 12.4964 , nights: 4 },
      { id: 3, name: "Logan Pass", description: "Higuest point in the park", latitude: 41.3851, longitude: 2.1734, nights: 3 },
      { id: 4, name: "Bison Fields", description: "Perfect for Wildlife photography", latitude: 52.3676, longitude: 4.9041 , nights: 2 },
    ],

    user = {
      name: "Emily Traveler",
      avatarUrl: "/Emily.jpg",
      username: "@worldexplorer",
    },

    comments = [
      {
        id: 1,
        user: { name: "Alex Adventure", avatarUrl: "/profile1.jpg", username: "@alexadventure" },
        content: "This trip looks amazing! I've been to Paris and it's absolutely stunning. Can't wait to see more of your photos!",
        likes: 15,
        replies: 2,
        timestamp: "2h ago"
      },
      {
        id: 2,
        user: { name: "Sarah Nomad", avatarUrl: "/fprofile3.jpg", username: "@sarahnomad" },
        content: "Barcelona is my favorite city! Make sure to visit La Sagrada Familia, it's breathtaking.",
        likes: 8,
        replies: 1,
        timestamp: "1h ago"
      },
      {
        id: 3,
        user: { name: "Mike Backpacker", avatarUrl: "/profile2.jpg", username: "@mikebackpacker" },
        content: "Great itinerary! How are you traveling between cities? Train or flights?",
        likes: 5,
        replies: 3,
        timestamp: "30m ago"
      }
    ]
  } = props;

  const getRequestTrip = async (tripId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/trip/${tripId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Trip Route Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching trip route:', error);
    }
  };

  const id = await params.tripId;
  const { trip, stops: tripStops } = await getRequestTrip(id);

  // const cookieStore = await cookies();
  // const supabase = createClient(cookieStore)
  // const id = await params.tripId;
  // const trip = await getTripById(id, supabase);
  const { description, title, header_image_url } = trip || {};


  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <div className="relative w-full h-[300px] overflow-hidden rounded-t-lg">
          <Image
            src={header_image_url || '/header.jpg'}
            alt="Trip header"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div className="bg-background rounded-b-lg shadow-md">
          <div className="container mx-auto px-4 py-6 flex items-center space-x-4">
            <div className="relative w-24 h-24 -mt-16">
              <Image
                src={user.avatarUrl}
                alt={user.name}
                layout="fill"
                objectFit="cover"
                className="rounded-full border-4 border-background"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <div className="mt-1 text-lg text-muted-foreground">
                <span className="font-semibold">{user.name}</span> • <span>{user.username}</span>
              </div>
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
        stops={tripStops}
        comments={comments}
      />
    </div>
  )
}