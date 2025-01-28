import { PreLovedItem, GorseItem } from './types';

const GORSE_API_URL = 'http://localhost:8088';

export class GorseClient {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Generate initial likes for a new user
  async generateInitialLikes(numLikes: number = 10): Promise<void> {
    try {
      // Get random items to like
      const response = await fetch(`${GORSE_API_URL}/api/latest?n=50`);
      const itemIds = await response.json();
      
      // Randomly select some items to like
      const itemsToLike = itemIds
        .sort(() => Math.random() - 0.5)
        .slice(0, numLikes);

      // Submit likes for these items
      const promises = itemsToLike.map(async (itemId: string) => {
        await this.submitFeedback(itemId, 'like');
        // Add a small delay between likes to make them look more natural
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to generate initial likes:', error);
      throw error;
    }
  }

  // Get recommended items for a user
  async getRecommendations(n: number = 10): Promise<PreLovedItem[]> {
    const response = await fetch(`${GORSE_API_URL}/api/recommend/${this.userId}?n=${n}`);
    const itemIds = await response.json();
    return await this.getItemDetails(itemIds);
  }

  // Get popular items
  async getPopularItems(n: number = 10): Promise<PreLovedItem[]> {
    const response = await fetch(`${GORSE_API_URL}/api/popular?n=${n}`);
    const itemIds = await response.json();
    return await this.getItemDetails(itemIds);
  }

  // Get latest items
  async getLatestItems(n: number = 10): Promise<PreLovedItem[]> {
    const response = await fetch(`${GORSE_API_URL}/api/latest?n=${n}`);
    const itemIds = await response.json();
    return await this.getItemDetails(itemIds);
  }

  // Get items by category
  async getItemsByCategory(category: string, n: number = 10): Promise<PreLovedItem[]> {
    const response = await fetch(`${GORSE_API_URL}/api/popular?category=${category}&n=${n}`);
    const itemIds = await response.json();
    return await this.getItemDetails(itemIds);
  }

  // Submit feedback (like/dislike)
  async submitFeedback(itemId: string, feedbackType: 'like' | 'dislike'): Promise<void> {
    await fetch(`${GORSE_API_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        FeedbackType: feedbackType === 'like' ? 'star' : 'hide',
        UserId: this.userId,
        ItemId: itemId,
        Timestamp: new Date().toISOString(),
      }]),
    });
  }

  // Get details for multiple items
  private async getItemDetails(itemIds: string[]): Promise<PreLovedItem[]> {
    const items = await Promise.all(
      itemIds.map(async (id) => {
        const response = await fetch(`${GORSE_API_URL}/api/item/${id}`);
        const item = await response.json() as GorseItem;
        return this.convertGorseItem(item);
      })
    );
    return items;
  }

  // Convert Gorse item format to PreLovedItem
  private convertGorseItem(gorseItem: GorseItem): PreLovedItem {
    const labels = JSON.parse(gorseItem.Labels || '{}');
    return {
      id: gorseItem.ItemId,
      imageUrl: labels.imageUrl || '/placeholder.jpg',
      name: gorseItem.Comment || 'Untitled Item',
      brand: labels.brand || 'Unknown Brand',
      price: parseFloat(labels.price) || 0,
      condition: labels.condition || 'Unknown',
      size: labels.size || 'One Size',
      categories: JSON.parse(gorseItem.Categories || '[]'),
    };
  }
} 
