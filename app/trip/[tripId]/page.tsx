import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import TripPageClient from './trip-page-client'
import { Trip, Stop, Profile, TripComment, TripPageProps} from '@/utils/types'
import { getTripById } from '@/utils/controllers/tripController'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabaseClient';
import { MapProvider } from "@/providers/map-provider";


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

    comments = [
      {
        id: 1,
        profile: { name: "Alex Adventure", avatarUrl: "/profile1.jpg", profilename: "@alexadventure" },
        content: "This trip looks amazing! I've been to Paris and it's absolutely stunning. Can't wait to see more of your photos!",
        likes: 15,
        replies: 2,
        timestamp: "2h ago"
      },
      {
        id: 2,
        profile: { name: "Sarah Nomad", avatarUrl: "/fprofile3.jpg", profilename: "@sarahnomad" },
        content: "Barcelona is my favorite city! Make sure to visit La Sagrada Familia, it's breathtaking.",
        likes: 8,
        replies: 1,
        timestamp: "1h ago"
      },
      {
        id: 3,
        profile: { name: "Mike Backpacker", avatarUrl: "/profile2.jpg", profilename: "@mikebackpacker" },
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
      // console.log('Trip Route Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching trip route:', error);
    }
  };

  const id = await params.tripId;
  const { trip, stops, profile } = await getRequestTrip(id);

  // const cookieStore = await cookies();
  // const supabase = createClient(cookieStore)
  // const id = await params.tripId;
  // const trip = await getTripById(id, supabase);
  const { description, title, header_image_url } = trip || {};


  return (
    <MapProvider>

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
                  src={profile.avatar_url}
                  alt={profile.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full border-4 border-background"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <div className="mt-1 text-lg text-muted-foreground">
                  <span className="font-semibold">{profile.name}</span> • <span>{`@ ${profile.username}`}</span>
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
          stops={stops}
          comments={comments}
        />
      </div>
    </MapProvider>
  )
}