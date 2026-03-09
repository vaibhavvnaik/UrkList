# urk — Promotional Newsletter Aggregator  

> **Live at [urklist.com](https://urklist.com)** — a unified feed of brand promotional emails, organized by category so you never miss a deal.

---

## What It Does

Brands constantly send promotional emails — sale alerts, promo codes, limited-time offers — but they get buried in your inbox. **urk** aggregates these promotional newsletters from 15+ retail categories into a single browsable feed.

A dedicated inbox receives brand emails. urk captures each one, extracts the subject line, pulls the brand thumbnail, and surfaces it in a filterable, date-ranged feed organized by category.

**Live demo**: Browse today's deals at [urklist.com](https://urklist.com)

---

## Key Features

- **15 category feeds** — Grocery, Footwear, Home, Clothing, Auto, Health & Beauty, Entertainment, Travel, Babies & Kids, Sporting Goods, Pets, Luggage, Restaurants, Electronics, Lux
- **Date range filter** — narrow the feed to any time window (e.g. "March 4 to March 5")
- **Brand cards** — each card shows brand thumbnail, email subject line as headline, and timestamp
- **Real brands** — DSW, Costco, Anker, and 20+ other retail brands currently aggregated
- **Promo code extraction** — AI-powered parsing of email bodies to surface discount codes directly (in development)

---

## The Problem It Solves

Promotional emails expire before most people see them. They compete with 40 other unread emails, lack consistent formatting, and no single place exists to browse "what deals are live right now."

urk treats promotional emails as structured data — each email becomes a card in a browsable, categorized, date-filtered feed.

---

## Product Decisions & Tradeoffs

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 13 App Router | Server components + edge caching for feed performance |
| Database | MongoDB + Prisma ORM | Flexible schema for varying email formats across brands |
| Auth | NextAuth | Social login (Google/GitHub) without custom session management |
| Storage | Backblaze B2 + Cloudinary | B2 for raw email assets (cost-efficient), Cloudinary for on-demand image transforms |
| Deployment | Vercel | Zero-config Next.js deploys with preview URLs per branch |
| Email ingress | Dedicated inbox + forwarding webhook | Clean separation between personal email and aggregated brand promos |

---

## Tech Stack

Next.js 13 (App Router) · TypeScript · MongoDB · Prisma ORM
NextAuth · Tailwind CSS · Cloudinary · Backblaze B2 · Vercel

---

## Roadmap

- [x] Email ingestion pipeline
- [x] Category + date range filtering
- [x] Brand thumbnails & subject line previews
- [ ] AI promo code extraction (parse email body for discount codes via GPT-4o)
- [ ] Push notifications for high-value deals
- [ ] Personalized feed based on saved brands

---

## Status

Live in production at urklist.com · Actively developed

---

Built by Vaibhav Naik (https://linkedin.com/in/vaibhavvnaik) — PM who ships
