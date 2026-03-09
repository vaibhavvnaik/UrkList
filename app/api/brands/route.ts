import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  try {
    const brands = await prisma.brand.findMany();
    return NextResponse.json(brands);
  }
  catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
    request: Request, 
  ) {

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.error();
    }

    const body = await request.json();
    const { name, 
      description,
      siteURL,
      bannerImage,
      logo,
      email,
      category_id} = body;

    if (!name || !description) {
        return NextResponse.error();
    }
  
    const brand = await prisma.brand.create({
      data: {
        name,
        description,
        siteURL,
        bannerImage,
        logo,
        email,
        category_id
      }
    });
  
    return NextResponse.json(brand);
}
