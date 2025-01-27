'use client';

import Image from 'next/image';
import { PreLovedItem } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import placeholder from '/public/placeholder-image.jpg'

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
    const [allSwiped, setAllSwiped] = useState(false);

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

        // Check if this is the last item
        if (currentIndex + 1 >= totalItems) {
            setAllSwiped(true);
        }
    };

    const transValue = useMotionValue(0);
    const opacity = useTransform(transValue, [-150, 0, 150], [0, 1, 0]);
    const rotate = useTransform(transValue, [-150, 150], [-18, 18]);

    const likeButtonColor = useTransform(transValue, [0, 150], ['#6B7280', '#10B981']);
    const dislikeButtonColor = useTransform(transValue, [-150, 0], ['#EF4444 ', '#6B7280']);

    const likeButtonScale = useTransform(transValue, [0, 150], [1, 1.5]);
    const dislikeButtonScale = useTransform(transValue, [0, -150], [1, 1.5]);

    return (
        <AnimatePresence>
            <div className="relative w-full h-full">
                {/* No Items */}
                {allSwiped ? (
                    <div className="flex items-center justify-center w-full h-full text-center">
                        <p className="text-xl font-bold text-gray-700">Thanks for taking the quiz!</p>
                    </div>
                ) : (
                    <>
                        {/* Like button */}
                        <motion.button
                            variant="outline"
                            size="icon"
                            className="absolute mr-[12%] right-4 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full border-0 hover:bg-black z-10 flex items-center justify-center"
                            style={{ backgroundColor: likeButtonColor, scale: likeButtonScale }}
                        >
                            <Heart className="h-6 w-6 text-white" />
                        </motion.button>

                        {/* Dislike button */}
                        <motion.button
                            variant="outline"
                            size="icon"
                            className="absolute ml-[12%] left-4 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full border-0 hover:bg-black z-10 flex items-center justify-center"
                            style={{ backgroundColor: dislikeButtonColor, scale: dislikeButtonScale }}
                        >
                            <X className="h-6 w-6 text-white" />
                        </motion.button>

                        {/* Card */}
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

                            <Image
                                src={placeholder}
                                alt={item.name}
                                fill 
                                priority    
                                draggable={false}
                            />

                        </motion.div>
                    </>
                )}
            </div>
        </AnimatePresence>
    );
}