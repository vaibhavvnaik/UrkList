import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId: string;
}

export default async function getListingById(
  params: IParams
) {
  try {
    const { listingId } = params;

    // Local preview fallback for issue testing when DB is unavailable.
    if (listingId === "local-preview") {
      return {
        id: "local-preview",
        title: "Local Preview Newsletter",
        slugifyTitle: "local-preview-newsletter",
        brandEmail: "hello@example.com",
        createdAt: new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        messageId: "local-preview-message",
        content: "",
        htmlContent: `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f8f8f8; }
      .wrap { max-width: 640px; margin: 0 auto; background: #fff; padding: 24px; }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { color: #333; line-height: 1.5; }
      .cta { display: inline-block; margin-top: 14px; padding: 10px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Spring Drop: 30% Off</h1>
      <p>Tracking link test:
        <a href="https://example.com/product?utm_source=newsletter&utm_medium=email&affid=abc123">Shop now</a>
      </p>
      <p>Affiliate link test:
        <a href="https://example.org/deal?ref=partner99&campaign=spring">Claim deal</a>
      </p>
      <a class="cta" href="https://example.net/checkout?coupon=SAVE30&src=email">Checkout with SAVE30</a>
    </div>
  </body>
</html>`.trim(),
        promoCodes: ["SAVE30"],
        discountText: "30% off selected items",
        brandId: "local-brand",
        userId: "local-user",
        brand: {
          id: "local-brand",
          name: "Local Test Brand",
          slug: "local-test-brand",
          siteURL: "https://example.com",
          logo: null,
          bannerImage: null,
          description: null,
          email: "hello@example.com",
          region: null,
          category_id: "local-category",
          category: {
            id: "local-category",
            name: "Fashion",
            description: "Local preview category",
          },
        },
        user: {
          id: "local-user",
          name: "Local User",
          email: "local@example.com",
          emailVerified: null,
          image: null,
          hashedPassword: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          favoriteIds: [],
          followedBrandIds: [],
        },
      };
    }

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
      createdAt: listing.createdAt.toString(),
      receivedAt: listing.receivedAt?.toISOString() ?? null,
      // Phase 1: include new fields
      htmlContent: listing.htmlContent ?? null,
      promoCodes: listing.promoCodes ?? [],
      discountText: listing.discountText ?? null,
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toString(),
        updatedAt: listing.user.updatedAt.toString(),
        emailVerified: listing.user.emailVerified?.toString() || null,
      }
    };
  } catch (error) {
    return null;
  }
}
