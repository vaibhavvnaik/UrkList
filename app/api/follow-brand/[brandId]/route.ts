import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  brandId?: string;
}

// POST: follow a brand
export async function POST(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { brandId } = await params;

  if (!brandId || typeof brandId !== 'string') {
    throw new Error('Invalid brand ID');
  }

  let followedBrandIds = [...(currentUser.followedBrandIds || [])];

  // Prevent duplicates
  if (!followedBrandIds.includes(brandId)) {
    followedBrandIds.push(brandId);
  }

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: { followedBrandIds },
  });

  return NextResponse.json(user);
}

// DELETE: unfollow a brand
export async function DELETE(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { brandId } = await params;

  if (!brandId || typeof brandId !== 'string') {
    throw new Error('Invalid brand ID');
  }

  let followedBrandIds = [...(currentUser.followedBrandIds || [])];
  followedBrandIds = followedBrandIds.filter((id) => id !== brandId);

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: { followedBrandIds },
  });

  return NextResponse.json(user);
}
