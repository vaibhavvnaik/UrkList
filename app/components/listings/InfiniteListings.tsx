'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SafeListing, SafeUser } from '@/app/types';
import ListingCard from './ListingCard';
import qs from 'query-string';
import useRegisterModal from '@/app/hooks/useRegisterModal';

const PAGE_SIZE = 24;
const UNAUTHENTICATED_LISTING_LIMIT = 150;

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
  const registerModal = useRegisterModal();
  const [listings, setListings] = useState<SafeListing[]>(initialListings);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialListings.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Check if unauthenticated user has reached the listing limit
  const isLimitReached = !currentUser && listings.length >= UNAUTHENTICATED_LISTING_LIMIT;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    // Check if unauthenticated user has reached the limit
    if (!currentUser && listings.length >= UNAUTHENTICATED_LISTING_LIMIT) {
      setLimitReached(true);
      setHasMore(false);
      return;
    }

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
        const updatedListings = [...listings, ...newListings];

        // For unauthenticated users, cap at the limit
        if (!currentUser && updatedListings.length >= UNAUTHENTICATED_LISTING_LIMIT) {
          setListings(updatedListings.slice(0, UNAUTHENTICATED_LISTING_LIMIT));
          setLimitReached(true);
          setHasMore(false);
        } else {
          setListings(updatedListings);
        }
      }

      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more listings:', error);
      setHasMore(false);
    }

    setLoading(false);
  }, [loading, hasMore, page, searchParams, currentUser, listings]);

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
      {!limitReached && !isLimitReached && (
        <div ref={sentinelRef} className="h-10 mt-4" />
      )}
      {loading && (
        <div className="flex justify-center py-4 text-neutral-500">
          Loading...
        </div>
      )}
      {(limitReached || isLimitReached) && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-neutral-100 rounded-xl p-8 max-w-md text-center">
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              Want to see more listings?
            </h3>
            <p className="text-neutral-600 mb-6">
              Sign up for free to explore all available listings and unlock more features.
            </p>
            <button
              onClick={registerModal.onOpen}
              className="
                bg-rose-500
                hover:bg-rose-600
                text-white
                font-semibold
                py-3
                px-8
                rounded-lg
                transition
                duration-200
              "
            >
              Sign Up to Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InfiniteListings;
