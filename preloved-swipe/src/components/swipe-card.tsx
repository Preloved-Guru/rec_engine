'use client';

import Image from 'next/image';
import { PreLovedItem } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';

interface SwipeCardProps {
    item: PreLovedItem;
    onLike: (item: PreLovedItem) => void;
    onDislike: (item: PreLovedItem) => void;
    onNext: () => void;
    onPrevious: () => void;
    currentIndex: number;
    totalItems: number;
}

export function SwipeCard({
    item,
    onLike,
    onDislike,
    onNext,
    onPrevious,
    currentIndex,
    totalItems
}: SwipeCardProps) {
    return (
        <Card className="w-full max-w-2xl mx-auto bg-[#B7C4E0] rounded-3xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/80 border-0 hover:bg-black"
                    onClick={() => onDislike(item)}
                >
                    <X className="h-6 w-6 text-white" />
                </Button>
            </div>
            <div className="absolute top-4 right-4 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/80 border-0 hover:bg-black"
                    onClick={() => onLike(item)}
                >
                    <Heart className="h-6 w-6 text-white" />
                </Button>
            </div>

            {/* Navigation arrows */}
            <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white text-4xl"
            >
                ←
            </button>
            <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white text-4xl"
            >
                →
            </button>

            {/* Main image */}
            <div className="relative aspect-[4/3] w-full">
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Navigation dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {Array.from({ length: totalItems }).map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </Card>
    );
} 