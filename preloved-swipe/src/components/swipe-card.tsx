'use client';

import Image from 'next/image';
import { PreLovedItem } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

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
    const handleDragEnd = (event: any, info: any) => {
        const offset = info.offset.x;

        if (offset > 100) {
            // Swiped right -> Like
            onLike(item);
            onNext();
        } else if (offset < -100) {
            // Swiped left -> Dislike
            onDislike(item);
            onNext();
        }
    };

    const transValue = useMotionValue(0);

    const opacity = useTransform(transValue, [-150, 0, 150], [0, 1, 0]);
    const rotate = useTransform(transValue, [-150, 150], [-18, 18])

    return (
        <AnimatePresence>
            <motion.div 
                className="w-full h-full border max-w-[40%] mx-auto bg-[#B7C4E0] rounded-3xl overflow-hidden relative"
                style={{
                    x: transValue, 
                    rotate: rotate, 
                    opacity: opacity,
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={handleDragEnd}
                >
                <div className="absolute top-4 right-4 z-10 flex flex-row gap-1 bg-primary p-2 rounded-md">
                    <div className="text-white font-bold">
                        ${item.price} - 
                    </div>
                    <div className="text-white">
                        {item.name}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
        
    );
} 