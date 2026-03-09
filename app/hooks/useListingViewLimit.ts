'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'viewedListingIds';
const MAX_LISTINGS = 100;

export const useListingViewLimit = () => {
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const ids = JSON.parse(stored) as string[];
        setViewedIds(new Set(ids));
      } catch {
        setViewedIds(new Set());
      }
    }
    setIsInitialized(true);
  }, []);

  const trackListings = useCallback((listingIds: string[]) => {
    setViewedIds((prev) => {
      const updated = new Set(prev);
      listingIds.forEach((id) => updated.add(id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(updated)));
      return updated;
    });
  }, []);

  const hasReachedLimit = viewedIds.size >= MAX_LISTINGS;
  const viewedCount = viewedIds.size;
  const remainingViews = Math.max(0, MAX_LISTINGS - viewedIds.size);

  return {
    trackListings,
    hasReachedLimit,
    viewedCount,
    remainingViews,
    isInitialized,
    maxListings: MAX_LISTINGS,
  };
};
