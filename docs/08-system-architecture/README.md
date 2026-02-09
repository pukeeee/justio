# Розділ 8: System Architecture

**Версія:** 1.0  
**Дата:** 27 січня 2026  
**Власник:** Technical Lead  

---

## 8.1. Architecture Overview

### 🏗️ High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                   USERS                          │
│            (Web, Mobile, Desktop)                │
└────────────┬─────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│              CDN (Vercel Edge)                   │
│         (Static assets, caching)                 │
└────────────┬─────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│          FRONTEND (Next.js 16 App)               │
│  ┌────────────────────────────────────────────┐  │
│  │ Client Components (React 19)               │  │
│  │ - UI Components                            │  │
│  │ - State Management (Zustand)               │  │
│  │ - Offline Storage (IndexedDB)              │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │ Server Components                          │  │
│  │ - Data Fetching                            │  │
│  │ - SSR/SSG                                  │  │
│  └────────────────────────────────────────────┘  │
└────────────┬─────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│          API LAYER (Serverless)                  │
│  ┌────────────────────────────────────────────┐  │
│  │ Supabase Client                            │  │
│  │ - Auth (JWT)                               │  │
│  │ - Realtime subscriptions                   │  │
│  │ - Row Level Security                       │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │ Vercel Edge Functions                      │  │
│  │ - PDF generation                           │  │
│  │ - Email sending                            │  │
│  │ - External API calls                       │  │
│  └────────────────────────────────────────────┘  │
└────────────┬─────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│          BACKEND (Supabase)                      │
│  ┌────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                        │  │
│  │ - Cases, Clients, Events, Documents        │  │
│  │ - Full-text search                         │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │ Storage (S3-compatible)                    │  │
│  │ - Document files                           │  │
│  │ - User avatars                             │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │ Auth                                       │  │
│  │ - Email/Password                           │  │
│  │ - OAuth (Google)                           │  │
│  │ - JWT tokens                               │  │
│  └────────────────────────────────────────────┘  │
└────────────┬─────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│       EXTERNAL SERVICES                          │
│  - SendGrid (Emails)                             │
│  - Дія.Підпис API (Ukrainian e-signature)        │
│  - Stripe/Fondy (Payments)                       │
│  - Court Registries APIs (Phase 2)               │
└──────────────────────────────────────────────────┘
```

---

## 8.2. Technology Stack

### 🔧 Frontend

**Framework:**
- **Next.js 16** (App Router)
  - Server Components for data fetching
  - Client Components for interactivity
  - SSR/SSG for SEO

**Language:**
- **TypeScript 5.5+**
  - Strict mode
  - No `any` types
  - Full type safety

**UI Library:**
- **React 19**
  - Hooks (useState, useEffect, useReducer)
  - Context API for global state
  - Concurrent rendering

**Styling:**
- **Tailwind CSS 4**
  - Utility-first
  - Custom design tokens
  - JIT compilation

**State Management:**
- **Zustand** (lightweight, no boilerplate)
- React Query для server state

**Offline:**
- **IndexedDB** (Dexie.js wrapper)
- Service Workers (PWA)

**Forms:**
- **React Hook Form** + Zod validation

---

### 🔙 Backend

**Database:**
- **PostgreSQL 16** (via Supabase)
  - JSONB для flexible fields
  - Full-text search
  - Row Level Security (RLS)

**API:**
- **Supabase** (BaaS)
  - Auto-generated REST API
  - Realtime subscriptions
  - Built-in auth

**Storage:**
- **Supabase Storage** (S3-compatible)
  - File uploads
  - CDN delivery
  - Signed URLs

**Functions:**
- **Vercel Edge Functions** (when needed)
  - Serverless
  - Edge deployment
  - Sub-50ms latency

---

### 📦 Third-Party Services

| Service | Purpose | Why |
|---------|---------|-----|
| **Vercel** | Hosting, CDN | Next.js native, auto-scaling |
| **Supabase** | Database, Auth, Storage | PostgreSQL, full-featured BaaS |
| **SendGrid** | Transactional emails | 99.9% delivery, templates |
| **Stripe** | Payments (international) | Industry standard |
| **Fondy** | Payments (Ukraine) | Local cards support |
| **Дія.Підпис** | E-signatures | Ukrainian legal requirement |

---

## 8.3. Architecture Patterns

### 🏛️ Clean Architecture (Layered)

```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  (UI Components, Pages)             │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Application Layer                  │
│  (Business Logic, Use Cases)        │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Data Access Layer                  │
│  (API calls, Supabase client)       │
└─────────────────────────────────────┘
```

**Приклад структури:**
```
/app
  /dashboard
    page.tsx (Server Component)
    /components
      DashboardStats.tsx
      RecentCases.tsx
  /cases
    /[id]
      page.tsx
      /components
        CaseDetails.tsx
        DocumentList.tsx
/lib
  /api (Data Access)
    cases.ts
    clients.ts
  /hooks (Application Logic)
    useCases.ts
    useClients.ts
  /utils
    validation.ts
    formatting.ts
```

---

### 🔄 Data Flow

**Read (Server Component):**
```
Page → Supabase Query → Data → Render
```

**Write (Client Component):**
```
User Action → Mutation → Supabase → Realtime Update → Re-render
```

**Offline Write:**
```
User Action → IndexedDB → Queue → Sync when online
```

---

## 8.4. Database Schema (Overview)

### 📊 Core Tables

```sql
-- Users (handled by Supabase Auth)
users
  id: uuid (PK)
  email: string
  created_at: timestamp

-- Organizations (law firms)
organizations
  id: uuid (PK)
  name: string
  owner_id: uuid (FK users)
  subscription_tier: enum
  created_at: timestamp

-- Clients
clients
  id: uuid (PK)
  organization_id: uuid (FK)
  type: enum (individual, legal_entity)
  name: string
  phone: string
  email: string
  metadata: jsonb (flexible fields)
  created_at: timestamp

-- Cases
cases
  id: uuid (PK)
  organization_id: uuid (FK)
  client_id: uuid (FK clients)
  title: string
  case_number: string (optional)
  type: enum (civil, criminal, etc)
  status: enum (new, active, completed, archived)
  description: text
  created_at: timestamp
  updated_at: timestamp

-- Events (calendar)
events
  id: uuid (PK)
  organization_id: uuid (FK)
  case_id: uuid (FK cases)
  title: string
  type: enum (hearing, meeting, deadline)
  start_time: timestamp
  end_time: timestamp
  location: string
  reminders: jsonb [{type, time_before}]
  created_at: timestamp

-- Documents
documents
  id: uuid (PK)
  case_id: uuid (FK cases)
  organization_id: uuid (FK)
  filename: string
  file_path: string (Supabase Storage)
  size: integer
  mime_type: string
  uploaded_by: uuid (FK users)
  created_at: timestamp

-- Time Logs
time_logs
  id: uuid (PK)
  case_id: uuid (FK cases)
  user_id: uuid (FK users)
  date: date
  duration: interval (hours/minutes)
  description: text
  billable: boolean
  created_at: timestamp

-- Invoices
invoices
  id: uuid (PK)
  organization_id: uuid (FK)
  client_id: uuid (FK clients)
  case_id: uuid (FK cases, optional)
  number: string
  status: enum (draft, sent, paid, overdue)
  items: jsonb [{description, quantity, price}]
  total: decimal
  issued_at: date
  due_at: date
  paid_at: date (optional)
```

---

### 🔐 Row Level Security (RLS)

**Policies:**
```sql
-- Cases: users can only see their organization's cases
CREATE POLICY "Users see own org cases"
  ON cases FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid()
  ));

-- Similar policies for all tables
```

---

## 8.5. API Design

### 🔌 Supabase Client (Main API)

**Query Examples:**
```typescript
// Fetch cases
const { data: cases, error } = await supabase
  .from('cases')
  .select(`
    *,
    client:clients(*),
    events(count)
  `)
  .eq('status', 'active')
  .order('updated_at', { ascending: false });

// Create case
const { data: newCase, error } = await supabase
  .from('cases')
  .insert({
    title: 'Divorce Case',
    client_id: 'uuid',
    type: 'civil',
    status: 'new'
  })
  .select()
  .single();

// Realtime subscription
supabase
  .channel('cases')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'cases'
  }, (payload) => {
    // Handle real-time update
  })
  .subscribe();
```

---

### ⚡ Edge Functions (Custom Logic)

**Use Cases:**
- PDF generation (invoices, reports)
- Email sending (notifications, invoices)
- External API calls (Дія.Підпис)

**Example:**
```typescript
// /api/generate-invoice-pdf
export async function POST(req: Request) {
  const { invoiceId } = await req.json();
  
  // Fetch invoice data
  const invoice = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
  
  // Generate PDF
  const pdfBuffer = await generatePDF(invoice);
  
  // Return
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`
    }
  });
}
```

---

## 8.6. Authentication & Authorization

### 🔐 Auth Flow

```
User → Sign up/Login → Supabase Auth → JWT Token
                                      ↓
                         Session stored in cookie
                                      ↓
                         Every API call includes JWT
                                      ↓
                         RLS policies validate access
```

**Providers:**
- Email + Password
- Google OAuth
- (Phase 2: Microsoft, Apple)

**Session Management:**
- JWT tokens (refresh + access)
- HttpOnly cookies
- Auto-refresh before expiry

---

### 👥 Roles & Permissions

**MVP (Simple):**
- **Owner** — full access
- **Lawyer** — can create/edit cases, clients
- **Assistant** — read-only + basic edits

**Phase 2:**
- Granular permissions per feature
- Custom roles

---

## 8.7. File Storage Architecture

### 📁 Supabase Storage

**Buckets:**
```
- documents/ (case files)
  - {organization_id}/
    - {case_id}/
      - {document_id}.pdf

- avatars/ (user profile pics)
  - {user_id}.jpg

- invoices/ (generated PDFs)
  - {organization_id}/
    - {invoice_number}.pdf
```

**Security:**
- Signed URLs (time-limited access)
- RLS policies on storage buckets
- Virus scanning (ClamAV integration — Phase 2)

**Limits:**
- Free plan: 1GB
- Solo: 5GB
- Team: 50GB
- Firm: 500GB

---

## 8.8. Offline Strategy

### 💾 IndexedDB Schema

```typescript
// Local database structure
const db = new Dexie('JustioDB');

db.version(1).stores({
  cases: 'id, organization_id, updated_at',
  clients: 'id, organization_id, updated_at',
  events: 'id, start_time, case_id',
  time_logs: 'id, case_id, date',
  sync_queue: '++id, action, timestamp'
});
```

**Sync Strategy:**
```
1. User makes change offline
   → Save to IndexedDB
   → Add to sync_queue

2. App goes online
   → Process sync_queue (FIFO)
   → POST to Supabase
   → Remove from queue on success

3. Conflicts
   → Last-write-wins (MVP)
   → Conflict resolution UI (Phase 2)
```

**What works offline:**
- View cases, clients, events
- Create new case/client/event (queued)
- Edit existing (queued)
- View documents (cached)

**What doesn't work offline:**
- Upload documents
- Generate invoices
- Dія.Підпис

---

## 8.9. Performance Optimization

### ⚡ Frontend

**Code Splitting:**
```typescript
// Dynamic imports for heavy components
const CaseEditor = dynamic(() => import('./CaseEditor'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

**Image Optimization:**
```typescript
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  width={40}
  height={40}
  alt="User"
  loading="lazy"
/>
```

**Caching:**
- Static pages: ISR (60s revalidate)
- Dynamic data: React Query (5min stale time)

---

### 🗄️ Backend

**Database Indexes:**
```sql
CREATE INDEX idx_cases_org_status
  ON cases(organization_id, status);

CREATE INDEX idx_events_case_time
  ON events(case_id, start_time);

-- Full-text search
CREATE INDEX idx_cases_search
  ON cases USING gin(to_tsvector('ukrainian', title || ' ' || description));
```

**Query Optimization:**
- SELECT only needed columns
- Avoid N+1 queries (use joins)
- Pagination (20 items/page)

---

### 📊 Monitoring

**Metrics:**
- Vercel Analytics (page views, performance)
- Supabase Dashboard (DB queries, errors)
- Sentry (error tracking — Phase 2)

**Alerts:**
- 5xx errors > 1%
- P95 latency > 1s
- Database connections > 80%

---

## 8.10. Security Architecture

### 🔒 Security Layers

**1. Network Security:**
- HTTPS everywhere (TLS 1.3)
- CORS policies
- Rate limiting (100 req/min per user)

**2. Application Security:**
- Input validation (Zod schemas)
- SQL injection protection (Parameterized queries)
- XSS prevention (React auto-escaping + DOMPurify)
- CSRF tokens

**3. Data Security:**
- RLS policies (database level)
- Encryption at rest (Supabase)
- Encryption in transit (HTTPS)

**4. Auth Security:**
- Password hashing (bcrypt)
- JWT expiration (15min access, 7day refresh)
- No sensitive data in JWT

---

### 🛡️ Compliance

**GDPR:**
- Right to access (data export)
- Right to delete (cascade deletion)
- Right to portability (JSON/CSV export)
- Consent management

**Ukrainian Law:**
- Personal data protection
- Lawyer-client confidentiality
- 3-year document retention

---

## 8.11. Scalability

### 📈 Growth Projections

| Users | Requests/sec | DB Size | Strategy |
|-------|-------------|---------|----------|
| 1k | 10 | 10GB | Current setup ✅ |
| 10k | 100 | 100GB | Supabase Firm |
| 100k | 1,000 | 1TB | Read replicas, CDN |
| 1M | 10,000 | 10TB | Sharding, microservices |

**MVP → 10k users:** Current architecture is sufficient

**10k → 100k users (Phase 2):**
- Database read replicas
- Redis caching
- CDN for files
- Background job queues

---

### 🔄 Auto-Scaling

**Vercel:**
- Automatic scaling (serverless)
- Edge network (global CDN)

**Supabase:**
- Vertical scaling (upgrade plan)
- Connection pooling (PgBouncer)

---

## 8.12. Disaster Recovery

### 💾 Backup Strategy

**Automated Backups:**
- **Database:** Daily (Supabase automatic)
- **Files:** Replicated across S3 regions
- **Retention:** 30 days

**Recovery Point Objective (RPO):** < 24 hours  
**Recovery Time Objective (RTO):** < 4 hours

---

### 🚨 Incident Response

**Severity Levels:**
- **P0 (Critical):** Service down — fix within 1 hour
- **P1 (High):** Major feature broken — fix within 4 hours
- **P2 (Medium):** Minor issue — fix within 24 hours

**On-Call Rotation:** (Phase 2, коли команда > 3)

---

## 8.13. Development Workflow

### 🛠️ CI/CD Pipeline

```
Code Push → GitHub
     ↓
GitHub Actions
  - Linting (ESLint)
  - Type checking (tsc)
  - Unit tests (Vitest)
  - Build
     ↓
Preview Deployment (Vercel)
  - Automatic preview URL
  - QA testing
     ↓
Merge to main
     ↓
Production Deployment (Vercel)
  - Automatic
  - Zero-downtime
```

**Branches:**
- `main` — production
- `develop` — staging
- `feature/*` — features

---

## 8.14. Tech Debt & Future Migrations

### 🔮 Planned Improvements (Post-MVP)

**Phase 2:**
- Move heavy computations to queue (BullMQ + Redis)
- Add ElasticSearch for advanced search
- GraphQL API (Apollo) for complex queries
- Microservices for billing

**Phase 3:**
- Multi-region deployment
- AI/ML features (own servers or OpenAI)

---

## 8.15. Architecture Decision Records (ADRs)

### ADR-001: Why Next.js?

**Decision:** Use Next.js 16 App Router

**Rationale:**
- Server Components → better performance
- Built-in SSR/SSG
- Great DX (developer experience)
- Large ecosystem
- Vercel native (easy deployment)

**Alternatives Considered:**
- Remix (less mature)
- Vite + React Router (more setup)

---

### ADR-002: Why Supabase?

**Decision:** Use Supabase as BaaS

**Rationale:**
- PostgreSQL (powerful, familiar)
- Built-in auth, storage
- RLS for security
- Realtime subscriptions
- Cost-effective for MVP

**Alternatives Considered:**
- Firebase (NoSQL не підходить)
- Custom backend (занадто довго для MVP)

---

### ADR-003: Why Zustand?

**Decision:** Zustand for state management

**Rationale:**
- Minimal boilerplate
- TypeScript-first
- React Query for server state
- Zustand for UI state

**Alternatives Considered:**
- Redux (занадто складний)
- Context API (performance issues)

---

## 8.16. System Constraints

### 📏 Technical Limits

**Supabase Free Tier:**
- 500MB DB
- 1GB Storage
- 2GB bandwidth/month
- 50,000 monthly active users

**When to Upgrade:** ~500 users

**Vercel Free Tier:**
- 100GB bandwidth/month
- No limits on deployments

**When to Upgrade:** Never for MVP, maybe Phase 2

---

## 8.17. Key Metrics

**System Health:**
- Uptime: 99.9% (8.7 hours/year downtime allowed)
- TTFB: < 500ms (p95)
- API latency: < 200ms (p95)
- Error rate: < 0.1%

**Performance:**
- Lighthouse score: > 90
- Core Web Vitals: Green
- Time to Interactive: < 3s

---

**Наступний крок:** Детальна схема бази даних (Data Model)

**Відповідальний:** Tech Lead + Backend Developer

**Статус:** ✅ Architecture Approved
