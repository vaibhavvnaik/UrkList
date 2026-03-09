import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  }
  catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
    request: Request,
  ) {

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description,} = body;

    if (!name || !description) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      }
    });

    return NextResponse.json(category);
}