import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  }
  catch (error) {
    return NextResponse.error();
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
    const { name, description,} = body;

    if (!name || !description) {
        return NextResponse.error();
    }
  
    const category = await prisma.category.create({
      data: {
        name,
        description,
      }
    });
  
    return NextResponse.json(category);
}
