export type Trip = {
    title: string, 
    description: string, 
    id: number, 
    header_image_url: string,
    user_id: number, 
    created_at: Date
}

export type Stop = {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    nights: number;
    pois: Poi[]
};

export type Poi = {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    stop_id: number;
    category: string;
    created_at: Date;
    updated_at: Date;
    user_id: number;
    images: string[];
};
  
export type Profile = {
    name: string;
    avatarUrl: string;
    username: string;
};

export type TripComment = {
    id: number;
    profile: Profile;
    content: string;
    likes: number;
    replies: number;
    timestamp: string;
};

export type TripPageProps = {
    title: string;
    description: string;
    headerImageUrl: string;
    tripImages: string[];
    mapImageUrl: string;
    stops: Stop[];
    profile: Profile;
    comments: Comment[];
};

