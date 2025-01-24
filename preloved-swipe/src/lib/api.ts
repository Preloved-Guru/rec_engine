import axios from 'axios';
import { PreLovedItem, FeedbackPayload } from './types';

// Configure Gorse API URL - in production, this should come from environment variables
const GORSE_API = process.env.NEXT_PUBLIC_GORSE_API || 'http://localhost:8088';

export async function getRecommendations(userId: string, count: number = 50): Promise<PreLovedItem[]> {
    try {
        const response = await axios.get<PreLovedItem[]>(
            `${GORSE_API}/api/recommend/${userId}`,
            { params: { n: count } }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
    }
}

export async function sendFeedback(feedbackItems: FeedbackPayload[]): Promise<boolean> {
    try {
        await axios.post(`${GORSE_API}/api/feedback`, feedbackItems);
        return true;
    } catch (error) {
        console.error('Failed to send feedback:', error);
        return false;
    }
}

export function createFeedbackPayload(userId: string, itemId: string): FeedbackPayload {
    return {
        FeedbackType: 'like',
        UserId: userId,
        ItemId: itemId,
        Timestamp: new Date().toISOString(),
    };
} 