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
      <section className="p-8 ">
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
            <button className="bg-secondary rounded-sm px-6 py-2 text-primary font-bold hover:bg-secondary/90 ">
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
