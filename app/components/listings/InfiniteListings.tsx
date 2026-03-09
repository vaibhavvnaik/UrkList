'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SafeListing, SafeUser } from '@/app/types';
import ListingCard from './ListingCard';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import qs from 'query-string';
import { GUEST_LISTING_LIMIT, LISTINGS_PAGE_SIZE } from '@/app/config/listings';

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
  const [hasMore, setHasMore] = useState(initialListings.length === LISTINGS_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const registerModal = useRegisterModal();

  const isGuestLimitReached = !currentUser && listings.length >= GUEST_LISTING_LIMIT;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    if (!currentUser && listings.length >= GUEST_LISTING_LIMIT) return;

    setLoading(true);

    const nextPage = page + 1;
    const queryString = qs.stringify(
      { ...searchParams, page: nextPage },
      { skipNull: true, skipEmptyString: true }
    );

    try {
      const res = await fetch(`/api/listings?${queryString}`);
      const newListings = await res.json();

      if (!Array.isArray(newListings) || newListings.length < LISTINGS_PAGE_SIZE) {
        setHasMore(false);
      }

      if (Array.isArray(newListings)) {
        setListings((prev) => {
          const combined = [...prev, ...newListings];
          if (!currentUser && combined.length >= GUEST_LISTING_LIMIT) {
            return combined.slice(0, GUEST_LISTING_LIMIT);
          }
          return combined;
        });
      }

      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more listings:', error);
      setHasMore(false);
    }

    setLoading(false);
  }, [loading, hasMore, page, searchParams, currentUser, listings.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || isGuestLimitReached) return;

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
  }, [loadMore, isGuestLimitReached]);

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
      {isGuestLimitReached ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-lg text-neutral-600 text-center">
            Sign up to browse all listings
          </p>
          <button
            onClick={() => registerModal.onOpen()}
            className="
              bg-rose-500
              hover:bg-rose-600
              text-white
              font-semibold
              py-3
              px-8
              rounded-lg
              transition
            "
          >
            Sign up
          </button>
        </div>
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
