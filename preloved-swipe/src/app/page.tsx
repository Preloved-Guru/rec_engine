'use client';

import { useState, useEffect } from 'react';
import { SwipeCard } from '@/components/swipe-card';
import { ProductCarousel } from '@/components/product-carousel';
import { PreLovedItem } from '@/lib/types';
import { GorseClient } from '@/lib/gorse-client';
import { mockTrendingJewelry, mockNewShoes, mockUser } from '@/lib/mock-data';

// TODO: Replace with real user authentication
const MOCK_USER_ID = 'U000001';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendedItems, setRecommendedItems] = useState<PreLovedItem[]>([]);
  const [likedItems, setLikedItems] = useState<PreLovedItem[]>([]);
  const [dislikedItems, setDislikedItems] = useState<PreLovedItem[]>([]);
  const [gorseClient] = useState(() => new GorseClient(MOCK_USER_ID));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, ensure we have initial likes for this user
        await gorseClient.generateInitialLikes();

        // Then load recommendations
        const recommended = await gorseClient.getRecommendations(20);
        setRecommendedItems(recommended);
      } catch (error) {
        console.error('Failed to load items:', error);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [gorseClient]);

  const handleLike = async (item: PreLovedItem) => {
    try {
      await gorseClient.submitFeedback(item.id, 'like');
      setLikedItems([...likedItems, item]);
      handleNext();
    } catch (error) {
      console.error('Failed to submit like:', error);
    }
  };

  const handleDislike = async (item: PreLovedItem) => {
    try {
      await gorseClient.submitFeedback(item.id, 'dislike');
      setDislikedItems([...dislikedItems, item]);
      handleNext();
    } catch (error) {
      console.error('Failed to submit dislike:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < recommendedItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Main swipe section */}
      <section className="p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* User Profile Card */}
          <div className="bg-primary rounded-3xl p-6 text-white text-center shadow-md">
            <h2 className="text-secondary text-3xl font-semibold mb-4">
              Hi {mockUser.name}!
            </h2>
            <div className="mb-14 mt-8">
              <h3 className="text-secondary text-lg font-semibold mb-4">
                Your style profile
              </h3>
              <div className="space-y-3 text-black font-bold max-w-sm mx-auto">
                <div className="flex justify-between w-full bg-white p-3 rounded-md">
                  <span>Shoes</span>
                  <span className="text-xs">size {mockUser.sizes.shoes}</span>
                </div>
                <div className="flex justify-between w-full bg-white p-3 rounded-md">
                  <span>Pants</span>
                  <span className="text-xs">size {mockUser.sizes.pants}</span>
                </div>
                <div className="flex justify-between w-full bg-white p-3 rounded-md">
                  <span>Tops</span>
                  <span className="text-xs">size {mockUser.sizes.tops}</span>
                </div>
                <div className="flex justify-between w-full bg-white p-3 rounded-md">
                  <span>Interests</span>
                  <span className="text-xs">{mockUser.interests.join(' & ')}</span>
                </div>
              </div>
            </div>
            <button className="bg-secondary rounded-sm px-6 py-2 text-primary font-bold hover:bg-secondary/90">
              Edit Profile
            </button>
          </div>

          {/* Swipe Card */}
          <div className="flex items-center justify-center min-h-[600px]">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Building your personalized recommendations...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            ) : recommendedItems.length > 0 ? (
              <SwipeCard
                item={recommendedItems[currentIndex]}
                onLike={handleLike}
                onDislike={handleDislike}
                onNext={handleNext}
                onPrevious={handlePrevious}
                currentIndex={currentIndex}
                totalItems={recommendedItems.length}
              />
            ) : (
              <div className="text-center text-gray-600">
                <p>No recommendations available at the moment.</p>
                <p className="mt-2">Try updating your style preferences!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending Jewelry Section */}
      <ProductCarousel
        title="Trending now in Jewelry"
        subtitle="We think you might love these..."
        items={mockTrendingJewelry}
      />

      {/* New Shoes Section */}
      <ProductCarousel
        title="New in shoes"
        items={mockNewShoes}
      />
    </main>
  );
}
