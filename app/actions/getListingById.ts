import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId: string;
}

export default async function getListingById(
  params: IParams
) {
  try {
    const { listingId } = params;

    // Extract the actual MongoDB ObjectId from the slug format "some-title-6507a1b2c3d4e5f6a7b8c9d0"
    const extractListingId = listingId.substring(listingId.lastIndexOf("-") + 1);

    const listing = await prisma.listing.findUnique({
      where: {
        id: extractListingId,
      },
      include: {
        user: true,
        brand: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!listing) {
      return null;
    }

    return {
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      receivedAt: listing.receivedAt?.toISOString() ?? null,
      // Phase 1: include new fields
      htmlContent: listing.htmlContent ?? null,
      promoCodes: listing.promoCodes ?? [],
      discountText: listing.discountText ?? null,
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toISOString(),
        updatedAt: listing.user.updatedAt.toISOString(),
        emailVerified: listing.user.emailVerified?.toISOString() || null,
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch listing.");
  }
}
