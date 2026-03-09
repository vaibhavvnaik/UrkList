import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'urk_viewed_listings';
const LISTING_LIMIT = 150;

interface UseListingViewLimitReturn {
  viewedCount: number;
  hasReachedLimit: boolean;
  remainingViews: number;
  trackListings: (listingIds: string[]) => void;
  resetViews: () => void;
}

const useListingViewLimit = (isLoggedIn: boolean): UseListingViewLimitReturn => {
  const [viewedListings, setViewedListings] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setViewedListings(new Set(parsed));
        }
      }
    } catch (error) {
      console.error('Failed to load viewed listings from storage:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(viewedListings)));
    } catch (error) {
      console.error('Failed to save viewed listings to storage:', error);
    }
  }, [viewedListings]);

  const trackListings = useCallback((listingIds: string[]) => {
    if (isLoggedIn) return;

    setViewedListings((prev) => {
      const updated = new Set(prev);
      listingIds.forEach((id) => updated.add(id));
      return updated;
    });
  }, [isLoggedIn]);

  const resetViews = useCallback(() => {
    setViewedListings(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const viewedCount = viewedListings.size;
  const hasReachedLimit = !isLoggedIn && viewedCount >= LISTING_LIMIT;
  const remainingViews = Math.max(0, LISTING_LIMIT - viewedCount);

  return {
    viewedCount,
    hasReachedLimit,
    remainingViews,
    trackListings,
    resetViews,
  };
};

export default useListingViewLimit;
export { LISTING_LIMIT };
