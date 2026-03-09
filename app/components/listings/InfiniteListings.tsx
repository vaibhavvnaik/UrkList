'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SafeListing, SafeUser } from '@/app/types';
import ListingCard from './ListingCard';
import SignupPrompt from './SignupPrompt';
import { useListingViewLimit } from '@/app/hooks/useListingViewLimit';
import qs from 'query-string';

const PAGE_SIZE = 24;

interface IListingsParams {
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  query?: string;
  brandSlug?: string;
}

interface InfiniteListingsProps {
  initialListings: SafeListing[];
  searchParams: IListingsParams;
  currentUser: SafeUser | null;
}

const InfiniteListings: React.FC<InfiniteListingsProps> = ({
  initialListings,
  searchParams,
  currentUser,
}) => {
  const [listings, setListings] = useState<SafeListing[]>(initialListings);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialListings.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { trackListings, hasReachedLimit, viewedCount, isInitialized } = useListingViewLimit();

  // Track initial listings
  useEffect(() => {
    if (isInitialized && !currentUser) {
      trackListings(initialListings.map((l) => l.id));
    }
  }, [isInitialized, currentUser, initialListings, trackListings]);

  const loadMore = useCallback(async () => {
    // Don't load more if user has reached limit (unless logged in)
    if (loading || !hasMore || (!currentUser && hasReachedLimit)) return;
    setLoading(true);

    const nextPage = page + 1;
    const queryString = qs.stringify(
      { ...searchParams, page: nextPage },
      { skipNull: true, skipEmptyString: true }
    );

    try {
      const res = await fetch(`/api/listings?${queryString}`);
      const newListings = await res.json();

      if (!Array.isArray(newListings) || newListings.length < PAGE_SIZE) {
        setHasMore(false);
      }

      if (Array.isArray(newListings)) {
        setListings((prev) => [...prev, ...newListings]);
        // Track viewed listings for non-logged-in users
        if (!currentUser) {
          trackListings(newListings.map((l: SafeListing) => l.id));
        }
      }

      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more listings:', error);
      setHasMore(false);
    }

    setLoading(false);
  }, [loading, hasMore, page, searchParams, currentUser, hasReachedLimit, trackListings]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div
        className="
          pt-16
          grid
          grid-cols-3
          sm:grid-cols-4
          md:grid-cols-5
          lg:grid-cols-6
          xl:grid-cols-7
          2xl:grid-cols-8
          gap-8
        "
      >
        {listings.map((listing) => (
          <ListingCard
            currentUser={currentUser}
            key={listing.id}
            data={listing}
          />
        ))}
      </div>
      {!currentUser && hasReachedLimit ? (
        <SignupPrompt viewedCount={viewedCount} />
      ) : (
        <>
          <div ref={sentinelRef} className="h-10 mt-4" />
          {loading && (
            <div className="flex justify-center py-4 text-neutral-500">
              Loading...
            </div>
          )}
        </>
      )}
    </>
  );
};

export default InfiniteListings;
