'use client';

import { useState } from 'react';
import { SwipeCard } from '@/components/swipe-card';
import { ProductCarousel } from '@/components/product-carousel';
import {
  mockProducts,
  mockUser,
  mockTrendingJewelry,
  mockNewShoes,
  PreLovedItem
} from '@/lib/mock-data';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<PreLovedItem[]>([]);

  const handleLike = (item: PreLovedItem) => {
    setLikedItems([...likedItems, item]);
    handleNext();
  };

  const handleDislike = (item: PreLovedItem) => {
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < mockProducts.length - 1) {
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* User Profile Card */}
          <div className="bg-primary rounded-3xl p-6 text-white">
            <h2 className="text-secondary text-3xl font-semibold mb-4">
              Hi {mockUser.name}!
            </h2>
            <p className="mb-8">
              It's nice to meet you. Take our Style Guru quiz so we can get to know you better.
              Would you wear it?
            </p>
            <div className="mb-8">
              <h3 className="text-secondary text-2xl font-semibold mb-4">
                Your style profile
              </h3>
              <div className="space-y-2">
                <p>Shoes | size {mockUser.sizes.shoes}</p>
                <p>Pants | size {mockUser.sizes.pants}</p>
                <p>Tops | size {mockUser.sizes.tops}</p>
                <p>Interested in {mockUser.interests.join(' & ')}</p>
              </div>
            </div>
            <button className="border-2 border-white rounded-full px-6 py-2 text-white hover:bg-white/10 transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Swipe Card */}
          <div className="flex items-center justify-center">
            <SwipeCard
              item={mockProducts[currentIndex]}
              onLike={handleLike}
              onDislike={handleDislike}
              onNext={handleNext}
              onPrevious={handlePrevious}
              currentIndex={currentIndex}
              totalItems={mockProducts.length}
            />
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
