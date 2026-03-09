import { Listing, Reservation, User, Category, Brand } from "@prisma/client";

export type SafeListing = Omit<Listing, "createdAt" | "receivedAt"> & {
  createdAt: string;
  receivedAt: string | null;
};

// Phase 1: listing with brand info included (for search results, brand pages)
export type SafeListingWithBrand = SafeListing & {
  brand: SafeBrand & {
    category: SafeCategory;
  };
};

export type SafeCategory = Category;

export type SafeBrand = Brand;

// Phase 1: brand with listing count and category
// Phase 2: added email frequency stats
export type SafeBrandWithDetails = SafeBrand & {
  category: SafeCategory;
  _count?: {
    listing: number;
  };
  firstEmailDate?: string | null;
  latestEmailDate?: string | null;
};

export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: SafeListingWithBrand;
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};
