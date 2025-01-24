'use client';

import Image from 'next/image';
import { PreLovedItem } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ProductCarouselProps {
    title: string;
    subtitle?: string;
    items: PreLovedItem[];
}

export function ProductCarousel({ title, subtitle, items }: ProductCarouselProps) {
    const [scrollPosition, setScrollPosition] = useState(0);

    const handleScroll = (direction: 'left' | 'right') => {
        const container = document.getElementById(`carousel-${title}`);
        if (!container) return;

        // Calculate the width of one item plus its gap
        const itemWidth = 250; // Width of each card
        const gap = 24; // Gap between cards (6 * 4 = 24px from gap-6)
        const scrollAmount = direction === 'left' ? -(itemWidth + gap) : (itemWidth + gap);

        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setScrollPosition(container.scrollLeft + scrollAmount);
    };

    return (
        <section className="py-12 bg-[#ECF39E]">
            <div className="max-w-7xl mx-auto px-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                    {subtitle && (
                        <p className="text-muted-foreground">{subtitle}</p>
                    )}
                </div>

                <div className="relative">
                    {/* Left scroll button */}
                    <button
                        onClick={() => handleScroll('left')}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    {/* Product cards */}
                    <div
                        id={`carousel-${title}`}
                        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {items.map((item) => (
                            <Card
                                key={item.id}
                                className="flex-none w-[250px] bg-white rounded-xl overflow-hidden snap-start hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="relative aspect-square">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-lg font-semibold">
                                            ${item.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <h3 className="font-medium truncate">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {item.brand}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Right scroll button */}
                    <button
                        onClick={() => handleScroll('right')}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </section>
    );
} 