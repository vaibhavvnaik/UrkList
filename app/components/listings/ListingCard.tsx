'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';


import useCountries from "@/app/hooks/useCountries";
import { 
  SafeListing, 
  SafeReservation, 
  SafeUser 
} from "@/app/types";

import HeartButton from "../HeartButton";
import Button from "../Button";
import ClientOnly from "../ClientOnly";
import getBrandById from "@/app/actions/getBrandById";

interface ListingCardProps {
  data: SafeListing;
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
  const { getByValue } = useCountries();

  const [previewImage, setPreviewImage] = useState<string>('');
  const [imageError, setImageError] = useState(false);
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
            {imageError ? (
              <div
                className="
                  absolute inset-0
                  bg-gradient-to-br from-neutral-100 to-neutral-200
                  flex items-center justify-center
                "
              >
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📧</div>
                  <div className="text-sm text-neutral-500 font-medium">
                    {data.title.slice(0, 50)}{data.title.length > 50 ? '...' : ''}
                  </div>
                </div>
              </div>
            ) : (
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
                onError={() => setImageError(true)}
              />
            )}
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
        <div className="font-semibold text-base">
          {data.title}
        </div>
        <div className="font-light text-neutral-500 text-sm">
          {new Date(data.receivedAt ?? data.createdAt).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          })}
        </div>
        <div className="font-light text-neutral-500">
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
