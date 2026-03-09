import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  try {
    const { listingId } = await params;

    if (!listingId || typeof listingId !== 'string') {
      return new NextResponse('Invalid listing ID', { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { htmlContent: true },
    });

    if (!listing || !listing.htmlContent) {
      return new NextResponse(
        '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#999;"><p>No email HTML available for this listing.</p></body></html>',
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Frame-Options': 'SAMEORIGIN',
          },
        }
      );
    }

    // Return the raw HTML content for iframe rendering
    return new NextResponse(listing.htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
