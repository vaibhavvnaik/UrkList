'use client';

import { useRouter } from "next/navigation";
import { SafeUser } from "@/app/types";
import HeartButton from "../HeartButton";
import { IoArrowBack } from "react-icons/io5";
import { HiOutlineExternalLink } from "react-icons/hi";
import { useRef, useEffect, useState } from "react";

interface ListingDetailProps {
  listing: {
    id: string;
    title: string;
    createdAt: string;
    receivedAt?: string | null;
    content: string;
    htmlContent?: string | null;
    promoCodes?: string[];
    discountText?: string | null;
    slugifyTitle?: string | null;
    brand: {
      id: string;
      name: string;
      slug?: string | null;
      siteURL?: string | null;
      logo?: string | null;
      category: {
        name: string;
      };
    };
  };
  currentUser?: SafeUser | null;
}

const ListingDetail: React.FC<ListingDetailProps> = ({
  listing,
  currentUser,
}) => {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(800);

  const isLikelyInlineHtml = (value?: string | null) => {
    if (!value) return false;
    const trimmed = value.trim();
    const lowered = trimmed.toLowerCase();
    return (
      lowered.startsWith("<!doctype html") ||
      lowered.startsWith("<html") ||
      lowered.startsWith("<body") ||
      lowered.includes("<table") ||
      lowered.includes("<a ")
    );
  };

  const isLikelyImageUrl = (value?: string | null) => {
    if (!value) return false;
    const trimmed = value.trim().toLowerCase();
    return (
      trimmed.startsWith("data:image/") ||
      /\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(trimmed)
    );
  };

  const withBaseTargetBlank = (html: string) => {
    const baseTag = '<base target="_blank" rel="noopener noreferrer">';
    if (/<base\s/i.test(html)) return html;
    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
    }
    return `${baseTag}${html}`;
  };

  // If htmlContent exists, always use it — it's explicitly stored as HTML.
  // Only apply the heuristic check to the generic `content` field.
  const inlineHtmlSource = listing.htmlContent
    ? listing.htmlContent
    : (isLikelyInlineHtml(listing.content) ? listing.content : null);

  // Fallback: use the email-html API endpoint to serve HTML from the DB
  const emailHtmlApiUrl = !inlineHtmlSource
    ? `/api/email-html/${listing.id}`
    : null;

  const remoteHtmlUrl = !inlineHtmlSource && !emailHtmlApiUrl && listing.content && !isLikelyImageUrl(listing.content)
    ? listing.content
    : null;

  useEffect(() => {
    if ((!inlineHtmlSource && !emailHtmlApiUrl) || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const handleLoad = () => {
      try {
        const body = iframe.contentDocument?.body;
        if (body) {
          setIframeHeight(body.scrollHeight + 40);
        }
      } catch (e) {
        // Cross-origin, keep default height
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [inlineHtmlSource, emailHtmlApiUrl]);

  const displayDate = new Date(listing.receivedAt ?? listing.createdAt).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const screenshotUrl = listing.slugifyTitle
    ? `${process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_URL}/${listing.slugifyTitle}-${listing.id}.png`
    : listing.content;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button + header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-neutral-100 transition"
        >
          <IoArrowBack size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-800">
            {listing.title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => router.push(`/brands/${listing.brand.slug || listing.brand.id}`)}
              className="text-sm font-medium text-rose-500 hover:underline"
            >
              {listing.brand.name}
            </button>
            <span className="text-sm text-neutral-400">{displayDate}</span>
          </div>
        </div>
        <HeartButton listingId={listing.id} currentUser={currentUser} />
      </div>

      {/* Promo codes banner */}
      {listing.promoCodes && listing.promoCodes.length > 0 && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="text-sm font-semibold text-green-800 mb-2">
            {listing.discountText || 'Promo Codes'}
          </div>
          <div className="flex flex-wrap gap-2">
            {listing.promoCodes.map((code, i) => (
              <button
                key={i}
                onClick={() => navigator.clipboard.writeText(code)}
                className="
                  px-3 py-1.5 bg-white border border-green-300 rounded-lg
                  text-sm font-mono font-bold text-green-700
                  hover:bg-green-100 transition cursor-pointer
                  active:scale-95
                "
                title="Click to copy"
              >
                {code}
              </button>
            ))}
          </div>
          <p className="text-xs text-green-600 mt-2">Click a code to copy</p>
        </div>
      )}

      {/* Email content */}
      <div className="border rounded-xl overflow-hidden bg-white">
        {inlineHtmlSource ? (
          <iframe
            ref={iframeRef}
            srcDoc={withBaseTargetBlank(inlineHtmlSource)}
            className="w-full border-none"
            style={{ height: `${iframeHeight}px` }}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            title={`Email: ${listing.title}`}
          />
        ) : emailHtmlApiUrl ? (
          <iframe
            ref={iframeRef}
            src={emailHtmlApiUrl}
            className="w-full border-none"
            style={{ height: `${iframeHeight}px` }}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            title={`Email: ${listing.title}`}
          />
        ) : remoteHtmlUrl ? (
          <iframe
            ref={iframeRef}
            src={remoteHtmlUrl}
            className="w-full border-none"
            style={{ height: `${iframeHeight}px` }}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            title={`Email: ${listing.title}`}
          />
        ) : (
          <img
            src={screenshotUrl}
            alt={listing.title}
            className="w-full"
            loading="lazy"
          />
        )}
      </div>

      {/* Visit brand */}
      {listing.brand.siteURL && (
        <div className="mt-6 text-center">
          <a
            href={listing.brand.siteURL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-rose-500 text-white rounded-full
              hover:bg-rose-600 transition font-semibold
            "
          >
            Shop at {listing.brand.name}
            <HiOutlineExternalLink size={16} />
          </a>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
