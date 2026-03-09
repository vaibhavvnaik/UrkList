import { LISTINGS_PAGE_SIZE } from "@/app/config/listings";
import prisma from "@/app/libs/prismadb";

export interface ISearchParams {
  query: string;
  category?: string;
  page?: number;
}

export default async function searchListings(params: ISearchParams) {
  try {
    const { query, category, page = 1 } = params;
    const skip = (page - 1) * LISTINGS_PAGE_SIZE;

    if (!query || query.trim().length === 0) {
      return [];
    }

    const where: any = {
      slugifyTitle: { not: null },
      title: {
        contains: query.trim(),
        mode: 'insensitive',
      },
    };

    if (category) {
      where.brand = {
        category: { name: category },
      };
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        brand: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { receivedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: LISTINGS_PAGE_SIZE,
    });

    return listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      receivedAt: listing.receivedAt?.toISOString() ?? null,
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Search failed.");
  }
}
