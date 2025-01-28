export interface PreLovedItem {
    id: string;
    imageUrl: string;
    name: string;
    brand: string;
    price: number;
    condition: string;
    size: string;
    categories: string[];
}

export interface UserProfile {
    name: string;
    sizes: {
        shoes: string;
        pants: string;
        tops: string;
    };
    interests: string[];
}

export interface GorseItem {
    ItemId: string;
    Comment?: string;
    Categories?: string;
    Labels?: string;
    Timestamp?: string;
}

export interface FeedbackPayload {
    FeedbackType: 'like';
    UserId: string;
    ItemId: string;
    Timestamp: string;
}

export interface BatchLikePayload {
    userId: string;
    likes: string[];
} 