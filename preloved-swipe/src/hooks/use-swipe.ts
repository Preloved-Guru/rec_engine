'use client';

import { useState, useEffect, useCallback } from 'react';
import { PreLovedItem } from '@/lib/types';
import { getRecommendations, sendFeedback, createFeedbackPayload } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useSwipe() {
    const { user } = useAuth();
    const [items, setItems] = useState<PreLovedItem[]>([]);
    const [likedItems, setLikedItems] = useState<PreLovedItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchItems = useCallback(async () => {
        if (isLoading || !hasMore || !user) return;

        setIsLoading(true);
        try {
            const newItems = await getRecommendations(user.id);
            if (newItems.length === 0) {
                setHasMore(false);
            } else {
                setItems(prev => [...prev, ...newItems]);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, user]);

    const handleLike = useCallback((item: PreLovedItem) => {
        setLikedItems(prev => [...prev, item]);
        setItems(prev => prev.slice(1));
    }, []);

    const handleSkip = useCallback(() => {
        setItems(prev => prev.slice(1));
    }, []);

    const flushLikes = useCallback(async () => {
        if (likedItems.length === 0 || !user) return false;

        const feedbackItems = likedItems.map(item =>
            createFeedbackPayload(user.id, item.ItemId)
        );

        const success = await sendFeedback(feedbackItems);
        if (success) {
            setLikedItems([]);
        }
        return success;
    }, [likedItems, user]);

    // Fetch more items when running low
    useEffect(() => {
        if (items.length < 5 && hasMore && user) {
            fetchItems();
        }
    }, [items.length, hasMore, fetchItems, user]);

    // Reset state when user changes
    useEffect(() => {
        setItems([]);
        setLikedItems([]);
        setHasMore(true);
    }, [user?.id]);

    return {
        currentItem: items[0],
        likedItems,
        isLoading,
        hasMore,
        handleLike,
        handleSkip,
        flushLikes,
    };
} 