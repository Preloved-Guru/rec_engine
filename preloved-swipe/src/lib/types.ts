export interface PreLovedItem {
    ItemId: string;
    IsHidden?: boolean;
    Categories?: string[];
    Labels?: {
        condition: string;
        brand: string;
        size: string;
        color: string;
        price: number;
        imageUrl?: string;
    };
    Comment?: string;
    imageUrl?: string;
    timestamp?: string;
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