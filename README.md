# Velora — Salon Service Management & Marketplace Platform

Velora is an enterprise-grade salon service management and marketplace system designed for both **in-salon appointments** and on-demand **home-service bookings**.

The platform is engineered natively on Windows using a modular monolith backend architecture, modern web portals, and PostgreSQL for authoritative transactional state.

---

## 1. Architecture Overview

Velora is organized as a Turborepo monorepo managed with `pnpm`:

```text
velora/
├── apps/
│   ├── web/        # Next.js 15 Customer & Partner Web Portal (Port 3000)
│   ├── admin/      # Next.js 15 Operations & Governance Console (Port 3001)
│   └── api/        # NestJS 11 Modular Monolith API (Port 4000)
│
├── packages/
│   ├── database/   # Prisma ORM schema & client (19 canonical data stores)
│   ├── types/      # Shared domain types, lifecycles, and DTO contracts
│   ├── ui/         # Design system tokens and accessible component primitives
│   └── typescript-config/ # Shared TypeScript configurations
│
└── Docs/           # Canonical Functional Requirements Specification
```

---

## 2. Requirements & Lifecycle Compliance

Directly traceable to `Docs/Salon_Service_Management_System_Comprehensive_Functional_Requirements_Specification.docx`:

### Canonical Booking Lifecycle
```
[Requested]
  → [Pending Assignment]
  → [Assigned]
  → [Provider Accepted]
  → [Confirmed]
  → [Provider En Route] (home-service)
  → [Provider Arrived]
  → [Service Started]
  → [Service Completed]
  → [Payment Completed]
  → [Closed]
```
*Terminal & Exception States:* `Cancelled`, `Rejected`, `Failed`, `No-Show`, `Rescheduled`, `Disputed`, `Refunded`.

### Canonical Payment Lifecycle
```
[Payment Pending]
  → [Payment Initiated]
  → [Authorized / Successful]
  → [Settlement Pending]
  → [Settled]
```
*Exception States:* `Failed / Retry Eligible`, `Refund Requested`, `Refunded / Partially Refunded`.

---

## 3. Windows Native Prerequisites

- **Windows 10 / 11** with **Windows Terminal** and **PowerShell**
- **Node.js**: `v20+` or `v24+` (verified `v24.20.0`)
- **pnpm**: `v9+` or `v12+` (verified `v12.4.1`)
- **Docker**: Docker Desktop for Windows (for local PostgreSQL & Redis)
- **Git for Windows**

---

## 4. Quickstart & Local Setup (PowerShell)

### 1. Clone & Enter Project Root
```powershell
Get-Location
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

### 3. Start Local Database & Cache (Docker)
```powershell
docker compose up -d
```
Verifies PostgreSQL on port `5432` and Redis on port `6379`.

### 4. Install Dependencies
```powershell
pnpm install
```

### 5. Generate Database Client & Push Schema
```powershell
pnpm db:generate
pnpm db:push
```

### 6. Run Full Monorepo in Development Mode
```powershell
pnpm dev
```
- **Customer & Partner Portal:** `http://localhost:3000`
- **Admin & Operations Console:** `http://localhost:3001`
- **Modular Monolith API:** `http://localhost:4000/api/v1`
- **Swagger API Documentation:** `http://localhost:4000/api/docs`

---

## 5. Development Quality Gates & Prohibitions

In accordance with Velora engineering principles:
- **No Vibe Coding:** Strict typography hierarchy, restrained color palettes, no generic purple/blue AI gradients, and no pill-shaped button overuse.
- **No Fabricated Data:** Empty states reflect honest reality; no fake reviews, counters, or testimonials.
- **Financial Auditability:** Money handled exclusively with decimal precision (no floating-point rounding errors).
- **Concurrency Protection:** Authoritative backend slot locks prevent overlapping bookings.
- **Legal Compliance:** Mandatory `/privacy-policy` and `/terms` routes live and accessible from the footer.
