# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**urklist** — a promotional newsletter aggregator. A dedicated inbox receives brand promotional emails; the app captures each one, extracts metadata (subject line, brand thumbnail, promo codes), and surfaces them in a filterable, categorized feed at urklist.com.

## Commands

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # prisma generate && next build
npm run lint         # next lint (ESLint with next/core-web-vitals)
npm start            # Start production server
```

No test framework is configured — there are no test commands.

After changing `prisma/schema.prisma`, run `npx prisma generate` to regenerate the client.

## Architecture

- **Framework**: Next.js 13 with App Router (`app/` directory), TypeScript, Tailwind CSS
- **Database**: MongoDB via Prisma ORM (`app/libs/prismadb.ts` is the singleton client)
- **Auth**: NextAuth (Google/GitHub) via `pages/api/auth/[...nextauth]`
- **UI components**: shadcn/ui in `components/ui/`, app-specific components in `app/components/`
- **Deployment**: Vercel; images served from Backblaze B2 and Cloudinary

### Key Data Models (prisma/schema.prisma)

- **Listing** — a single newsletter email (title, brand, screenshot URL, optional HTML content, promo codes)
- **Brand** — a sender brand with slug, logo, category relation
- **Category** — one of ~15 retail categories (Grocery, Footwear, etc.)
- **User** — NextAuth user with favoriteIds and followedBrandIds

### Code Layout

- `app/actions/` — Server-side data fetching functions (getListings, getBrandBySlug, getCurrentUser, etc.)
- `app/api/` — API routes: `listings/`, `brands/`, `brand-agent/`, `email-html/`, `favorites/`, `follow-brand/`, `categories/`, `register/`, `reservations/`
- `app/components/` — React components organized by domain: `listings/`, `navbar/`, `modals/`, `brands/`, `inputs/`, `search/`
- `app/hooks/` — Zustand-based modal state hooks (useLoginModal, useSearchModal, etc.) and data hooks (useFavorite, useFollowBrand)
- `app/types/index.ts` — Safe serialized types (SafeListing, SafeBrand, SafeUser, etc.) that convert Date fields to strings for client use
- `app/listings/[listingId]/` — Individual newsletter detail page
- `app/brands/` — Brand listing and `[slug]` detail pages

### Path Aliases

`@/*` maps to the project root (configured in tsconfig.json). Example: `@/app/components/Container`.

### Env Variables

The app needs `DATABASE_URL` (or `MONGODB_URI`) for MongoDB. The Prisma client supports both names. Other env vars include NextAuth secrets, Cloudinary/B2 credentials, and Google Analytics — see `.env.local` (gitignored).

### Nested Repositories

The repo contains several independent sub-projects (`urk/`, `brand-agent-railway/`, `fnl_reader/`, `access-onboarding-repo/`, `nextjs-tutorials/`, `vaibhavvnaik/`, `ip/`) that are separate from the main Next.js app. The main app code lives at the root level.
