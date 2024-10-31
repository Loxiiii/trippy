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
};
  
export type User = {
    name: string;
    avatarUrl: string;
    username: string;
};

export type TripComment = {
    id: number;
    user: User;
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
    user: User;
    comments: Comment[];
};

