import axios, { AxiosError } from 'axios';

const GORSE_API = 'http://localhost:8088';

export interface Item {
    id: string;
    score?: number;
    categories: string[];
    labels: {
        condition: string;
        brand: string;
        size: string;
        color: string;
        price: number;
    };
    comment: string;
}

// Define the feedback interface
interface GorseFeedback {
    FeedbackType: string;
    UserId: string;
    ItemId: string;
    Timestamp: string;
}

// Define the Gorse Score interface
interface GorseScore {
    id: string;
    score: number;
    is_hidden?: boolean;
    categories?: string[];
    timestamp?: string;
}

export type FeedbackType = 'star' | 'hide';

/**
 * Service to handle recommendations and feedback
 */
export class RecommendationService {
    private static instance: RecommendationService;

    private constructor() { }

    public static getInstance(): RecommendationService {
        if (!RecommendationService.instance) {
            RecommendationService.instance = new RecommendationService();
        }
        return RecommendationService.instance;
    }

    /**
     * Get popular items (for new users)
     */
    public async getPopularItems(n: number = 20): Promise<Item[]> {
        try {
            const response = await axios.get<GorseScore[]>(`${GORSE_API}/api/popular`, {
                params: { n }
            });
            return this.fetchItemDetails(response.data.map(item => item.id));
        } catch (error) {
            console.error('Failed to get popular items:', error);
            throw error;
        }
    }

    /**
     * Get personalized recommendations for a user
     */
    public async getRecommendations(userId: string, n: number = 20): Promise<Item[]> {
        try {
            const response = await axios.get(`${GORSE_API}/api/recommend/${userId}`, {
                params: { n }
            });
            return this.fetchItemDetails(response.data);
        } catch (error) {
            console.error('Failed to get recommendations:', error);
            throw error;
        }
    }

    /**
     * Send feedback to Gorse
     */
    public async sendFeedback(userId: string, itemId: string, feedbackType: FeedbackType): Promise<void> {
        try {
            const feedback: GorseFeedback[] = [{
                FeedbackType: feedbackType,
                UserId: userId,
                ItemId: itemId,
                Timestamp: new Date().toISOString()
            }];
            await axios.post(`${GORSE_API}/api/feedback`, feedback);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Failed to send feedback:', error);
            } else {
                console.error('Unknown error while sending feedback:', error);
            }
            throw error;
        }
    }

    /**
     * Fetch full item details from PostgreSQL
     * Note: In production, this would be a backend API call
     */
    private async fetchItemDetails(itemIds: string[]): Promise<Item[]> {
        try {
            // For now, fetch each item individually from Gorse
            // In production, this would be a single backend API call
            const items = await Promise.all(
                itemIds.map(async (id) => {
                    const response = await axios.get(`${GORSE_API}/api/item/${id}`);
                    return {
                        id: response.data.ItemId,
                        categories: JSON.parse(response.data.Categories),
                        labels: JSON.parse(response.data.Labels),
                        comment: response.data.Comment
                    };
                })
            );
            return items;
        } catch (error) {
            console.error('Failed to fetch item details:', error);
            throw error;
        }
    }
}

export default RecommendationService.getInstance(); 