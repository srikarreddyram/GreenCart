# Marketplace Platform — Product Requirements Document
**Version 1.0 | March 2026 | Status: Draft**

| Status | Owner | Stack | Backend |
|--------|-------|-------|---------|
| Draft | Product Team | React + Vite + Tailwind | Supabase |

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [Scope](#4-scope)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Key User Stories](#7-key-user-stories)
8. [Release Plan](#8-release-plan)
9. [Assumptions & Risks](#9-assumptions--risks)
10. [Appendix](#10-appendix)

---

## 1. Executive Summary

This document defines the product requirements for a full-featured e-commerce marketplace platform. The platform will connect buyers and sellers in a seamless digital storefront, powered by a React + Vite + Tailwind CSS v4 frontend and a Supabase backend providing PostgreSQL database, authentication, file storage, and real-time capabilities.

> **Vision Statement:** To deliver a best-in-class marketplace experience that enables sellers to list, manage, and sell products effortlessly while giving buyers a fast, personalised, and trustworthy shopping environment.

The platform targets three primary user types: **Buyers**, **Sellers**, and **Administrators**. The initial release (v1.0) focuses on core commerce flows — browsing, purchasing, order tracking, and seller management — with real-time notifications and file-based media management handled through Supabase Storage.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

- Launch a functional multi-vendor marketplace within the defined scope
- Enable sellers to onboard independently with minimal friction
- Provide buyers with a fast, mobile-responsive shopping experience
- Support multiple product categories with rich media
- Establish a foundation for future monetisation (commissions, subscriptions)

### 2.2 Key Success Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| Activation Rate | % of registered sellers who publish at least 1 product | ≥ 60% within 30 days |
| Conversion Rate | Visitor-to-purchase ratio | ≥ 3.5% |
| Time-to-Purchase | Avg. steps from landing to checkout complete | ≤ 4 clicks |
| Page Load Speed | LCP on product listing page | < 2.5 s |
| Auth Drop-off Rate | Users who abandon during sign-up | < 15% |
| Real-time Latency | Order status update delivery time | < 500 ms |
| Storage Uptime | Supabase Storage availability | 99.9% |
| Support Tickets | Bug-related tickets per 1,000 orders | < 5 |

---

## 3. User Personas

### 3.1 Buyer — "The Shopper"

| Attribute | Detail |
|-----------|--------|
| Age | 18 – 45 |
| Goal | Discover products, compare prices, purchase quickly, track orders |
| Pain Points | Too many steps to checkout, unclear shipping info, no order visibility |
| Device | Mobile-first (70%), Desktop (30%) |
| Key Features | Search & filter, wishlist, saved addresses, real-time order tracking |

### 3.2 Seller — "The Merchant"

| Attribute | Detail |
|-----------|--------|
| Age | 22 – 55 |
| Goal | List products, manage inventory, fulfil orders, receive payments |
| Pain Points | Complex dashboards, slow image uploads, delayed order notifications |
| Device | Desktop-first (65%), Mobile (35%) |
| Key Features | Product CRUD, bulk image upload, real-time order alerts, sales analytics |

### 3.3 Administrator — "The Platform Operator"

| Attribute | Detail |
|-----------|--------|
| Age | 25 – 50 |
| Goal | Manage users, moderate listings, resolve disputes, view platform analytics |
| Pain Points | Lack of moderation tools, manual user management |
| Device | Desktop (90%) |
| Key Features | User management, listing approval/rejection, analytics dashboard, audit logs |

---

## 4. Scope

### 4.1 In Scope — v1.0

- User authentication (sign-up, login, password reset, email verification) via Supabase Auth
- Buyer flows: browse, search, filter, product detail, cart, checkout, order history
- Seller flows: store setup, product management (CRUD), order management, media uploads
- Admin panel: user management, listing moderation, basic analytics
- Real-time: order status updates, new order notifications for sellers
- Supabase Storage: product images, store banners, user avatars
- Responsive UI using React, Radix UI, MUI components, and Tailwind CSS v4
- Row-Level Security (RLS) policies on all Supabase tables

### 4.2 Out of Scope — v1.0

- Native mobile applications (iOS / Android)
- Payment processing integration (placeholder UI only in v1.0)
- Multi-currency or internationalisation
- AI-powered recommendation engine
- Seller subscription / commission engine
- Third-party logistics integrations

---

## 5. Functional Requirements

### 5.1 Authentication & User Management

Powered by Supabase Auth with JWT sessions. All routes are protected via a React Router v7 auth guard.

| ID | Requirement | Priority |
|----|------------|---------|
| FR-AUTH-01 | Email & password sign-up with Supabase Auth | Must Have |
| FR-AUTH-02 | Email verification on registration | Must Have |
| FR-AUTH-03 | Login / logout with session persistence | Must Have |
| FR-AUTH-04 | Password reset via email magic link | Must Have |
| FR-AUTH-05 | OAuth login (Google) via Supabase Auth providers | Should Have |
| FR-AUTH-06 | Role assignment at sign-up: buyer, seller, admin | Must Have |
| FR-AUTH-07 | Profile page: avatar upload to Supabase Storage, bio, contact | Must Have |

### 5.2 Product Catalogue

| ID | Requirement | Priority |
|----|------------|---------|
| FR-CAT-01 | Sellers can create, read, update, delete product listings | Must Have |
| FR-CAT-02 | Product fields: title, description, price, SKU, stock qty, category, tags | Must Have |
| FR-CAT-03 | Up to 8 images per product, uploaded to Supabase Storage | Must Have |
| FR-CAT-04 | Products have status: draft, active, out-of-stock, archived | Must Have |
| FR-CAT-05 | Category taxonomy: parent + child categories managed by admin | Must Have |
| FR-CAT-06 | Full-text search using Supabase pg_trgm or ilike | Must Have |
| FR-CAT-07 | Filter by: price range, category, rating, availability | Should Have |
| FR-CAT-08 | Product variants (size, colour) with independent stock tracking | Should Have |
| FR-CAT-09 | Product ratings and reviews by verified buyers | Should Have |

### 5.3 Shopping Cart & Checkout

| ID | Requirement | Priority |
|----|------------|---------|
| FR-CART-01 | Persistent cart stored in Supabase (linked to user account) | Must Have |
| FR-CART-02 | Add / remove / update qty of items | Must Have |
| FR-CART-03 | Cart summary with subtotal, tax estimate, and shipping estimate | Must Have |
| FR-CART-04 | Multi-seller cart support (grouped by seller at checkout) | Must Have |
| FR-CART-05 | Checkout form: shipping address, contact info | Must Have |
| FR-CART-06 | Order placement creates order + order_items in DB atomically | Must Have |
| FR-CART-07 | Payment placeholder ("Pay on delivery" or mock gateway) | Must Have |
| FR-CART-08 | Order confirmation email (via Supabase Edge Functions or webhook) | Should Have |

### 5.4 Order Management

| ID | Requirement | Priority |
|----|------------|---------|
| FR-ORD-01 | Buyer: view order history, status timeline, and items | Must Have |
| FR-ORD-02 | Seller: view incoming orders, update status (confirmed, shipped, delivered) | Must Have |
| FR-ORD-03 | Real-time order status pushed to buyer via Supabase Realtime | Must Have |
| FR-ORD-04 | Seller receives real-time notification when a new order is placed | Must Have |
| FR-ORD-05 | Order cancellation within a configurable window | Should Have |
| FR-ORD-06 | Return / refund request workflow | Could Have |

### 5.5 Seller Dashboard

| ID | Requirement | Priority |
|----|------------|---------|
| FR-SELL-01 | Store setup: store name, logo (Storage), banner, description | Must Have |
| FR-SELL-02 | Product management table with search, filter, bulk status change | Must Have |
| FR-SELL-03 | Order queue with real-time incoming order badge | Must Have |
| FR-SELL-04 | Revenue summary: total sales, orders, avg order value (Recharts) | Should Have |
| FR-SELL-05 | Inventory alerts for low-stock products | Should Have |

### 5.6 Admin Panel

| ID | Requirement | Priority |
|----|------------|---------|
| FR-ADM-01 | User list: search, filter by role, suspend/unsuspend accounts | Must Have |
| FR-ADM-02 | Listing moderation: approve / reject products with reason | Must Have |
| FR-ADM-03 | Category management: create, rename, archive categories | Must Have |
| FR-ADM-04 | Platform analytics: GMV, active users, new sign-ups (Recharts) | Should Have |
| FR-ADM-05 | Audit log: all admin actions recorded with timestamp + actor | Should Have |

---

## 6. Non-Functional Requirements

| Area | Requirement | Priority |
|------|------------|---------|
| Performance | LCP < 2.5 s; TTI < 3.5 s. Lazy-load images from Supabase CDN. Code-split by route. | Critical |
| Security | All tables protected by Supabase RLS. HTTPS only. Auth tokens stored in httpOnly cookies. Input sanitisation on all forms. | Critical |
| Scalability | Supabase free tier for dev; upgrade to Pro for production. Connection pooling via PgBouncer (Supabase built-in). | High |
| Accessibility | WCAG 2.1 AA. Radix UI primitives provide ARIA. Keyboard navigation supported throughout. | High |
| Reliability | 99.9% uptime SLA. Supabase handles DB replication. Frontend deployed to Vercel/Netlify with CDN. | High |
| Realtime | Supabase Realtime channels for order status. Max 200ms delivery on local network. | High |
| Storage | Max image size 5 MB per upload. Accepted formats: JPEG, PNG, WebP. Images served via Supabase CDN transforms. | Medium |
| Maintainability | Components in `/src/components`. Shared hooks in `/src/hooks`. Supabase client in `/src/lib/supabase.ts`. | Medium |

---

## 7. Key User Stories

### Buyer
1. As a buyer, I want to search and filter products by category and price so I can find what I need quickly.
2. As a buyer, I want to add items from multiple sellers into one cart and check out in a single flow.
3. As a buyer, I want to see live updates on my order status without refreshing the page.
4. As a buyer, I want to leave a review on a product after my order is delivered.

### Seller
1. As a seller, I want to upload product photos from my device so my listings look professional.
2. As a seller, I want to receive an instant notification when a new order comes in.
3. As a seller, I want to update order status to keep buyers informed.
4. As a seller, I want to see a summary of my revenue and top-selling products.

### Admin
1. As an admin, I want to approve or reject product listings to keep the catalogue high-quality.
2. As an admin, I want to suspend a user account if it violates platform policies.

---

## 8. Release Plan

| Phase | Deliverables | Timeline |
|-------|-------------|---------|
| Phase 1 — Foundation | Auth, DB schema, Supabase setup, project scaffolding, routing | Weeks 1–2 |
| Phase 2 — Catalogue | Product CRUD, image upload, category management, search & filter | Weeks 3–4 |
| Phase 3 — Commerce | Cart, checkout, order placement, order history | Weeks 5–6 |
| Phase 4 — Realtime | Supabase Realtime channels, order notifications, seller alerts | Week 7 |
| Phase 5 — Dashboards | Seller dashboard, admin panel, analytics charts | Weeks 8–9 |
| Phase 6 — Polish | Performance, accessibility, RLS audit, bug fixes, QA | Week 10 |

---

## 9. Assumptions & Risks

### 9.1 Assumptions

- Supabase project will be provisioned before Phase 1 begins
- All team members have access to the Supabase dashboard
- Payment processing is out of scope for v1.0 and will be mocked
- The frontend will be deployed to Vercel or Netlify
- Email delivery for auth flows will use Supabase's built-in SMTP (or a custom SendGrid integration)

### 9.2 Risks

| Risk | Description | Mitigation |
|------|------------|-----------|
| Supabase Realtime limits | Free tier has connection caps; sudden traffic spike could break Realtime | Upgrade to Pro before launch; implement exponential backoff |
| RLS misconfiguration | Incorrect RLS policies could expose seller data across stores | Dedicated RLS audit in Phase 6 with automated tests |
| Image Storage costs | High-volume image uploads can escalate Supabase Storage costs | Enforce 5 MB limit; use image transforms to serve compressed previews |
| Multi-seller cart complexity | Cart items from different sellers add complexity to checkout atomicity | Use DB transactions (Supabase RPC) for order creation |

---

## 10. Appendix

### 10.1 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite 6 (via Figma Make) |
| Styling | Tailwind CSS v4 + Radix UI primitives + MUI components |
| Routing | React Router v7 |
| State / Data | Supabase JS client v2, React hooks |
| Charts | Recharts v2 |
| Animations | Motion (Framer Motion v12) |
| Backend / DB | Supabase (PostgreSQL 15) |
| Authentication | Supabase Auth (JWT + RLS) |
| File Storage | Supabase Storage (S3-compatible CDN) |
| Realtime | Supabase Realtime (Postgres CDC) |
| Deployment | Vercel / Netlify (frontend) + Supabase Cloud (backend) |

### 10.2 Glossary

| Term | Definition |
|------|-----------|
| GMV | Gross Merchandise Value — total value of goods sold through the platform |
| SKU | Stock Keeping Unit — unique product identifier |
| RLS | Row-Level Security — Postgres feature to restrict row access per user |
| CDC | Change Data Capture — Supabase Realtime mechanism to stream DB changes |
| LCP | Largest Contentful Paint — Core Web Vitals performance metric |
| TTI | Time to Interactive — performance metric for JS readiness |
| PgBouncer | Connection pooler built into Supabase for high-concurrency DB access |