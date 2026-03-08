import prisma from "@/app/libs/prismadb";

const PAGE_SIZE = 24;

export interface IListingsParams {
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  query?: string;       // Phase 1: full-text search
  brandSlug?: string;   // Phase 1: filter by brand
}

export default async function getListings(
  params: IListingsParams
) {
  try {
    const {
      category,
      startDate,
      endDate,
      page = 1,
      query,
      brandSlug,
    } = params;

    const skip = (page - 1) * PAGE_SIZE;

    // Build the where clause dynamically
    const where: any = {
      slugifyTitle: { not: null },
    };

    // Category filter
    if (category) {
      where.brand = {
        ...where.brand,
        category: { name: category },
      };
    }

    // Brand slug filter (for brand pages)
    if (brandSlug) {
      where.brand = {
        ...where.brand,
        slug: brandSlug,
      };
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Phase 1: Full-text search on title
    if (query && query.trim().length > 0) {
      where.title = {
        contains: query.trim(),
        mode: 'insensitive',
      };
    }

    const listings = await prisma.listing.findMany({
      include: {
        brand: {
          include: {
            category: true,
          },
        },
      },
      where,
      orderBy: [
        { receivedAt: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: PAGE_SIZE,
    });

    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      receivedAt: listing.receivedAt?.toISOString() ?? null,
    }));

    return safeListings;
  } catch (error) {
    // Keep homepage renderable in local/dev when DB credentials are unavailable.
    return [];
  }
}
