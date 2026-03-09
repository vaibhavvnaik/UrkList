const parsePositiveIntEnv = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
};

export const LISTINGS_PAGE_SIZE = parsePositiveIntEnv(
  process.env.NEXT_PUBLIC_LISTINGS_PAGE_SIZE ?? process.env.LISTINGS_PAGE_SIZE,
  24
);

export const GUEST_LISTING_LIMIT = parsePositiveIntEnv(
  process.env.NEXT_PUBLIC_GUEST_LISTING_LIMIT ?? process.env.GUEST_LISTING_LIMIT,
  150
);
