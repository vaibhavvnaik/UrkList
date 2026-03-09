'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import React from 'react';

import {
  SafeListingWithBrand,
  SafeReservation,
  SafeUser
} from "@/app/types";

import HeartButton from "../HeartButton";
import Button from "../Button";

interface ListingCardProps {
  data: SafeListingWithBrand;
  reservation?: SafeReservation;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null
};


const ListingCard: React.FC<ListingCardProps> = ({
  data,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = '',
  currentUser,
}) => {
  const router = useRouter();

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (disabled) {
      return;
    }

    onAction?.(actionId)
  }, [disabled, onAction, actionId]);
return (
    <div 
      onClick={() => router.push(`/listings/${data.slugifyTitle!}-${data.id}`)} 
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        <div 
          className="
            aspect-[2/3]
            w-full 
            relative 
            overflow-hidden 
            rounded-xl
          "
        >
            <Image
              fill
              className="
                object-cover 
                h-full 
                w-full 
                group-hover:scale-110 
                transition
              "
              src={`${process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_URL}/${data.slugifyTitle!}-${data.id}.png`}
              alt={data.title}
            />
          <div className="
            absolute
            top-3
            right-3
          ">
            <HeartButton 
              listingId={data.id} 
              currentUser={currentUser}
            />
          </div>
        </div>
        <div className="font-semibold text-base line-clamp-2">
          {data.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {data.brand?.logo ? (
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                fill
                className="rounded-full object-cover"
                src={data.brand.logo}
                alt={data.brand.name}
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-neutral-500">
                {data.brand?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <span
            className="text-sm font-medium text-neutral-700 truncate hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (data.brand?.slug) {
                router.push(`/brands/${data.brand.slug}`);
              }
            }}
          >
            {data.brand?.name}
          </span>
        </div>
        <div className="font-light text-neutral-500 text-xs">
          {new Date(data.receivedAt ?? data.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </div>
        {onAction && actionLabel && (
          <Button
            disabled={disabled}
            small
            label={actionLabel} 
            onClick={handleCancel}
          />
        )}
      </div>
    </div>
   );
}
 
export default ListingCard;
