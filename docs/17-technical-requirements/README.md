# Розділ 17: Technical Requirements

**Версія:** 1.0  
**Дата:** 27 січня 2026  
**Власник:** Engineering Team  

---

## 17.1. Executive Summary

**Мета:** Визначити технічні вимоги до системи для забезпечення надійності, продуктивності та масштабованості.

**Ключові Пріоритети:**
- 🚀 **Performance:** Швидкість завантаження <2s
- 📱 **Mobile-First:** PWA з offline режимом
- 🔒 **Security:** Enterprise-grade безпека
- 📈 **Scalability:** До 10,000 користувачів без рефакторингу
- 🛡️ **Reliability:** 99.5% uptime

---

## 17.2. System Architecture Requirements

### 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js 14 + React 18 + TypeScript + Tailwind │
│              (Vercel Hosting)                    │
└────────────────┬────────────────────────────────┘
                 │
                 │ API Calls (REST/GraphQL)
                 │
┌────────────────▼────────────────────────────────┐
│                   Backend                        │
│  Next.js API Routes + Vercel Serverless         │
└────────────────┬────────────────────────────────┘
                 │
                 │ SQL Queries
                 │
┌────────────────▼────────────────────────────────┐
│                  Database                        │
│         Supabase (PostgreSQL)                    │
│      Auth + Storage + Realtime                   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│               External Services                   │
│  • Stripe (Payments)                             │
│  • SendGrid (Email)                              │
│  • Sentry (Error Tracking)                       │
│  • Дія.Підпис API (E-Signature)                  │
└──────────────────────────────────────────────────┘
```

---

### 🎯 Technology Stack

**Frontend:**
| Technology | Version | Purpose | Why |
|-----------|---------|---------|-----|
| **Next.js** | 14.x | Framework | SSR, routing, performance |
| **React** | 18.x | UI library | Component-based, ecosystem |
| **TypeScript** | 5.x | Language | Type safety, developer experience |
| **Tailwind CSS** | 3.x | Styling | Utility-first, fast development |
| **Zustand** | 4.x | State mgmt | Simple, lightweight vs Redux |
| **React Query** | 5.x | Data fetching | Caching, optimistic updates |
| **React Hook Form** | 7.x | Forms | Performance, validation |
| **Zod** | 3.x | Validation | TypeScript-first schemas |

**Backend:**
| Technology | Version | Purpose | Why |
|-----------|---------|---------|-----|
| **Next.js API Routes** | 14.x | API | Serverless, same codebase |
| **Supabase** | Latest | Backend | Auth, DB, Storage, Realtime |
| **PostgreSQL** | 15.x | Database | Relational, reliable, full-text search |
| **Prisma** | 5.x | ORM | Type-safe queries, migrations |

**Infrastructure:**
| Service | Purpose | Tier |
|---------|---------|------|
| **Vercel** | Hosting, CDN, Functions | Firm ($20/mo) |
| **Supabase** | Database, Auth, Storage | Firm ($25/mo) |
| **AWS S3** | File storage (backup) | Pay-as-you-go |
| **Cloudflare** | DNS, DDoS protection | Free |

**DevOps:**
| Tool | Purpose |
|------|---------|
| **GitHub** | Version control, CI/CD |
| **GitHub Actions** | Automated testing, deployment |
| **Sentry** | Error tracking, monitoring |
| **Vercel Analytics** | Performance monitoring |

---

## 17.3. Performance Requirements

### ⚡ Speed Metrics (SLAs)

| Metric | Target | Critical Threshold | Measurement |
|--------|--------|-------------------|-------------|
| **Time to First Byte (TTFB)** | <500ms | <1s | Server response |
| **First Contentful Paint (FCP)** | <1.5s | <2.5s | User sees content |
| **Largest Contentful Paint (LCP)** | <2s | <3s | Main content loaded |
| **Time to Interactive (TTI)** | <3s | <5s | App is usable |
| **Cumulative Layout Shift (CLS)** | <0.1 | <0.25 | Visual stability |
| **First Input Delay (FID)** | <100ms | <300ms | Interaction responsiveness |

**Core Web Vitals:**
- LCP: <2.5s ✅
- FID: <100ms ✅
- CLS: <0.1 ✅

**Lighthouse Score:** >90 (all categories)

---

### 🎯 API Performance

| Endpoint | Target | Critical | Example |
|----------|--------|----------|---------|
| **GET (list)** | <200ms | <500ms | GET /api/cases |
| **GET (single)** | <100ms | <300ms | GET /api/cases/[id] |
| **POST/PUT** | <300ms | <1s | POST /api/cases |
| **DELETE** | <200ms | <500ms | DELETE /api/cases/[id] |

**Database Queries:**
- Simple SELECT: <50ms
- JOIN queries: <100ms
- Complex aggregations: <200ms

**File Upload:**
- 1MB file: <3s
- 10MB file: <15s
- Progress indicator for >5s uploads

---

### 📊 Load Testing

**Concurrent Users:**
| Phase | Users | Requests/sec | Response Time |
|-------|-------|-------------|---------------|
| MVP | 100 | 50 | <500ms |
| 6 months | 500 | 250 | <500ms |
| 12 months | 2,000 | 1,000 | <500ms |
| 24 months | 10,000 | 5,000 | <1s |

**Tools:**
- k6 (load testing)
- Artillery (stress testing)
- Lighthouse CI (performance CI)

---

## 17.4. Scalability Requirements

### 📈 Growth Projections

**User Growth:**
```
Month 0:    100 users
Month 6:    1,000 users
Month 12:   5,000 users
Month 24:   10,000 users
```

**Data Growth:**
```
Cases per user:         20-50
Documents per case:     5-10
Events per case:        3-5
Time entries per case:  10-20

Total (10k users):
- Cases:        200k - 500k
- Documents:    1M - 5M (files)
- Events:       600k - 2.5M
- Time entries: 2M - 10M
```

---

### 🔧 Scalability Strategy

**Horizontal Scaling:**
- Vercel: Auto-scales serverless functions
- Supabase: Vertical scale (upgrade plan)
- CDN: Global edge caching (Vercel Edge Network)

**Database Scaling:**
- Supabase Firm: Up to 100k users (sufficient for Phase 1-2)
- Connection pooling (Supavisor)
- Read replicas (if needed in Phase 3+)

**File Storage:**
- Supabase Storage: 100GB (Firm)
- AWS S3: Unlimited (fallback/backup)
- CDN caching for frequently accessed files

**Caching Strategy:**
- Edge caching (Vercel): Static assets
- API caching: React Query (client-side)
- Database caching: Supabase built-in

---

## 17.5. Availability & Reliability

### 🛡️ Uptime SLA

**Target:** 99.5% uptime
- Downtime allowed: ~3.6 hours/month
- Scheduled maintenance: off-peak hours (2-4 AM Kyiv time)

**Monitoring:**
- StatusPage.io (public status page)
- Sentry (error tracking)
- Vercel Analytics (uptime monitoring)
- Alerts: Slack + PagerDuty

**Incident Response:**
- P0 (critical): <15 min response, <1 hour resolution
- P1 (high): <1 hour response, <4 hours resolution
- P2 (medium): <4 hours response, <24 hours resolution
- P3 (low): <24 hours response, next sprint

---

### 💾 Backup & Recovery

**Database Backups:**
- Frequency: Daily automatic (Supabase)
- Retention: 7 days (Firm plan)
- Manual backups: Before major migrations

**File Storage Backups:**
- Supabase Storage: Replicated (built-in)
- AWS S3: Versioning enabled (retain 30 days)

**Recovery Time Objective (RTO):** 2 hours
**Recovery Point Objective (RPO):** 24 hours (max data loss)

**Disaster Recovery Plan:**
1. Detect incident (monitoring alerts)
2. Assess impact (which users affected?)
3. Restore from backup (latest snapshot)
4. Verify data integrity
5. Communicate to users
6. Post-mortem

---

## 17.6. Security Requirements

### 🔒 Authentication & Authorization

**Authentication Methods:**
- Email + Password (hashed with bcrypt)
- Google OAuth 2.0
- Magic link (passwordless) — Phase 2

**Password Requirements:**
- Minimum 8 characters
- Must include: uppercase, lowercase, number
- No common passwords (check against list)
- Rate limiting: 5 failed attempts → 15 min lockout

**Session Management:**
- JWT tokens (httpOnly cookies)
- Token expiration: 7 days
- Refresh tokens: 30 days
- Logout: Invalidate all sessions

**Authorization:**
- Role-Based Access Control (RBAC)
- Roles: Owner, Admin, Lawyer, Assistant
- Row-Level Security (Supabase RLS)
- API: Check user permissions on every request

---

### 🛡️ Data Security

**Encryption:**
- **At Rest:** AES-256 (database, file storage)
- **In Transit:** TLS 1.3 (HTTPS everywhere)
- **Application Level:** Encrypt sensitive fields (SSN, passport numbers)

**Secrets Management:**
- Environment variables (Vercel)
- No secrets in code (git-ignored .env.local)
- Rotate API keys quarterly

**Sensitive Data:**
- PII (Personally Identifiable Information): encrypted
- Financial data: encrypted
- Passwords: hashed (bcrypt, cost factor 12)

**Data Isolation:**
- Multi-tenancy: strict isolation by organization_id
- Users can't access other orgs' data
- Database: Row-Level Security (RLS) enforced

---

### 🚨 Security Monitoring

**Automated Scans:**
- npm audit (daily)
- Snyk (continuous vulnerability scanning)
- OWASP ZAP (weekly)

**Penetration Testing:**
- Before launch: basic pentest
- Quarterly: external security audit (Phase 2+)

**Intrusion Detection:**
- Rate limiting (API endpoints)
- Suspicious activity alerts (Sentry)
- Login anomaly detection (new device/location)

---

## 17.7. Compliance Requirements

### 📜 Data Protection

**GDPR (EU users):**
- User consent management
- Right to access (data export)
- Right to deletion (account deletion)
- Data portability (JSON/CSV export)
- Breach notification (<72 hours)

**Ukrainian Data Protection Law:**
- Адвокатська таємниця (attorney-client privilege)
- Personal data processing consent
- Data storage (minimum 3 years for legal documents)

**Audit Logging:**
- Log all access to sensitive data
- Retention: 1 year
- Fields: user_id, action, timestamp, IP address

---

### 🔐 Electronic Signature

**Дія.Підпис Integration:**
- Qualified Electronic Signature (QES)
- Legal validity in Ukraine
- Timestamp for each signature
- Verification API

**Requirements:**
- Store original signed document (immutable)
- Timestamp certificate
- Signature verification endpoint
- Revocation check

---

## 17.8. Mobile & Offline Requirements

### 📱 Progressive Web App (PWA)

**PWA Requirements:**
- Installable (Add to Home Screen)
- App-like experience (full-screen, no browser UI)
- Offline-capable (Service Worker)
- Push notifications (browser permission)

**Manifest:**
```json
{
  "name": "Justio CRM",
  "short_name": "Justio",
  "description": "CRM для юристів",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0066FF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker:**
- Cache static assets (JS, CSS, fonts, images)
- Cache API responses (read-only data)
- Background sync (when online)

---

### 🔌 Offline Functionality

**Offline-Capable:**
- ✅ View cases (recently accessed)
- ✅ View clients
- ✅ View calendar events
- ✅ View documents (cached)
- ✅ Log time entries (sync later)
- ❌ Upload files (online-only)
- ❌ Generate invoices (online-only)

**Sync Strategy:**
- Store offline actions in IndexedDB
- When online: sync to server
- Conflict resolution: last-write-wins (simple)
- User notification: "Syncing..." → "Synced ✓"

**Storage:**
- IndexedDB (local database)
- Quota: ~50MB (varies by browser)
- Fallback: LocalStorage (smaller, simpler)

---

### 📲 Mobile-Specific

**Performance:**
- First load: <3s (mobile 3G)
- Bundle size: <500KB (JS)
- Image optimization: WebP, lazy loading

**UX:**
- Touch gestures (swipe, long-press)
- Haptic feedback (iOS/Android)
- Native-like animations (60fps)

**Testing:**
- iOS Safari (iPhone 13+)
- Chrome Android (Samsung Galaxy S22+)
- BrowserStack (cloud devices)

---

## 17.9. Integration Requirements

### 🔌 Third-Party Integrations

**Phase 1 (MVP):**

| Integration | Purpose | API Type | Priority |
|------------|---------|----------|----------|
| **Дія.Підпис** | E-signature | REST | P0 |
| **Stripe** | Payments | REST | P0 |
| **SendGrid** | Email | REST | P0 |

**Phase 2:**

| Integration | Purpose | API Type | Priority |
|------------|---------|----------|----------|
| **Google Calendar** | Calendar sync | OAuth + REST | P1 |
| **Ukrainian Courts** | Case monitoring | REST (якщо є API) | P1 |
| **Google Drive** | Document backup | OAuth + REST | P2 |

**Phase 3:**

| Integration | Purpose | API Type | Priority |
|------------|---------|----------|----------|
| **Slack** | Notifications | Webhook | P2 |
| **Zapier** | Automation | REST | P2 |
| **Outlook** | Email/Calendar | Microsoft Graph | P2 |

---

### 🔗 API Design

**RESTful API:**
- Base URL: `https://justio.ua/api/v1`
- Versioning: `/v1/`, `/v2/` (future)
- Format: JSON
- Authentication: Bearer token (JWT)

**Example Endpoints:**
```
GET    /api/v1/cases          (list cases)
GET    /api/v1/cases/:id      (get case)
POST   /api/v1/cases          (create case)
PUT    /api/v1/cases/:id      (update case)
DELETE /api/v1/cases/:id      (delete case)

GET    /api/v1/clients
POST   /api/v1/clients
...
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100
  }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Назва справи обов'язкова",
    "field": "name"
  }
}
```

---

## 17.10. Browser & Device Support

### 🌐 Browser Support

**Desktop:**
| Browser | Min Version | Priority |
|---------|------------|----------|
| Chrome | Last 2 versions | P0 |
| Firefox | Last 2 versions | P1 |
| Safari | Last 2 versions | P1 |
| Edge | Last 2 versions | P1 |

**Mobile:**
| Browser | Min Version | Priority |
|---------|------------|----------|
| iOS Safari | iOS 15+ | P0 |
| Chrome Android | Android 10+ | P0 |

**NOT Supported:**
- Internet Explorer (EOL)
- Opera Mini (limited JS)

**Polyfills:**
- Core-js (ES6+ features)
- Intersection Observer (lazy loading)

---

### 📱 Device Support

**Smartphones:**
- iPhone: 13, 14, 15 (primary)
- Android: Samsung Galaxy S21+, Pixel 6+

**Tablets:**
- iPad (9th gen+)
- Android tablets (Samsung Tab S8+)

**Desktop:**
- Screen sizes: 1280×720 to 2560×1440
- Touch support: optional (Windows touchscreen)

**Testing Matrix:**
```
Device × OS × Browser

Priority P0:
- iPhone 14, iOS 17, Safari
- Samsung S22, Android 13, Chrome
- MacBook Firm, macOS, Chrome
- Windows 11, Chrome

Priority P1:
- iPad, iOS 17, Safari
- Windows 11, Firefox
```

---

## 17.11. Monitoring & Observability

### 📊 Application Monitoring

**Error Tracking:**
- Tool: Sentry
- Capture: JS errors, API errors, unhandled promises
- Alerts: Slack (#alerts)
- Threshold: >10 errors/hour → alert

**Performance Monitoring:**
- Tool: Vercel Analytics + Sentry Performance
- Metrics: TTFB, FCP, LCP, TTI, CLS, FID
- Alerts: LCP >3s for >5% users → investigate

**Custom Metrics:**
```typescript
// Track business metrics
analytics.track('case_created', {
  userId: user.id,
  caseType: 'civil',
  duration: 150, // ms
});
```

**Dashboards:**
- Grafana (custom dashboards)
- Vercel Analytics (built-in)
- Supabase Dashboard (DB metrics)

---

### 🔔 Alerting

**Alert Channels:**
- Slack: #alerts (real-time)
- Email: tech team
- PagerDuty: on-call rotation (Phase 2+)

**Alert Types:**

| Alert | Threshold | Priority |
|-------|-----------|----------|
| **Error Rate** | >5% of requests | Critical |
| **Response Time** | p95 >1s | High |
| **Database CPU** | >80% | High |
| **Storage** | >80% full | Medium |
| **Failed Logins** | >100/hour | Medium |

---

## 17.12. Development & Testing

### 🛠️ Development Environment

**Local Setup:**
```bash
# Required
- Node.js 20+
- npm or pnpm
- Git
- VS Code (recommended)

# Optional
- Docker (for Supabase local)
- PostgreSQL (for local DB)
```

**Environment Variables:**
```env
# .env.local (not committed)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
SENDGRID_API_KEY=...
```

**Dev Tools:**
- ESLint (linting)
- Prettier (formatting)
- Husky (pre-commit hooks)
- TypeScript (type checking)

---

### 🧪 Testing Requirements

**Unit Tests:**
- Coverage: >80% (critical code)
- Tool: Jest + React Testing Library
- Run: On every commit (CI)

**Integration Tests:**
- Coverage: >60% (critical paths)
- Tool: Playwright + Supertest
- Run: On PR

**E2E Tests:**
- Coverage: Top 10 user flows
- Tool: Playwright
- Run: Before release

**Performance Tests:**
- Tool: Lighthouse CI
- Run: On every deploy (staging)
- Threshold: Score >90

**Accessibility Tests:**
- Tool: axe DevTools
- Run: On PR
- Threshold: 0 violations

---

## 17.13. Deployment Requirements

### 🚀 CI/CD Pipeline

**GitHub Actions Workflow:**
1. Lint (ESLint + TypeScript)
2. Unit tests
3. Build
4. Integration tests
5. Deploy to staging (if develop branch)
6. E2E tests on staging
7. Deploy to production (if main branch)

**Deployment Targets:**
- Staging: `staging.justio.ua` (develop branch)
- Production: `justio.ua` (main branch)

**Rollback:**
- Vercel instant rollback (1-click)
- Automated: if E2E tests fail on prod

---

### 🔐 Environment Separation

| Environment | URL | Database | Purpose |
|------------|-----|----------|---------|
| **Local** | localhost:3000 | Local Supabase | Development |
| **Staging** | staging.justio.ua | Staging DB | Testing |
| **Production** | justio.ua | Production DB | Live users |

**Rules:**
- NEVER test on production DB
- Staging = production clone (same setup)
- Feature flags for gradual rollout

---

## 17.14. Documentation Requirements

### 📚 Code Documentation

**Required:**
- README.md (setup instructions)
- API documentation (OpenAPI/Swagger)
- Component documentation (Storybook)
- Database schema (ER diagram)

**Code Comments:**
- Complex logic only (code should be self-explanatory)
- JSDoc for public functions
- TODO comments for known issues

**Example:**
```typescript
/**
 * Creates a new case for a client
 * @param data - Case data (name, type, client_id)
 * @returns Created case with ID
 * @throws ValidationError if data is invalid
 */
async function createCase(data: CreateCaseInput): Promise<Case> {
  // Implementation
}
```

---

## 17.15. Non-Functional Requirements Summary

### ✅ Checklist

**Performance:**
- [ ] LCP <2.5s
- [ ] TTI <3s
- [ ] API response <300ms (p95)
- [ ] Lighthouse score >90

**Security:**
- [ ] HTTPS everywhere (TLS 1.3)
- [ ] Data encrypted (at rest + in transit)
- [ ] Row-Level Security (RLS)
- [ ] OWASP Top 10 mitigated
- [ ] npm audit: 0 high/critical

**Scalability:**
- [ ] Supports 10,000 users
- [ ] Horizontal scaling (serverless)
- [ ] Database connection pooling

**Reliability:**
- [ ] 99.5% uptime SLA
- [ ] Daily backups
- [ ] Disaster recovery plan
- [ ] Monitoring + alerts

**Accessibility:**
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Touch targets ≥44px

**Mobile:**
- [ ] PWA installable
- [ ] Offline mode (basic)
- [ ] Works on iOS + Android

**Compliance:**
- [ ] GDPR ready
- [ ] Ukrainian data law compliant
- [ ] Audit logging

---

## 17.16. Technology Decisions

### 🤔 Why These Choices?

**Next.js:**
- ✅ Best React framework (Vercel backing)
- ✅ Server-side rendering (performance)
- ✅ API routes (backend in same codebase)
- ✅ Excellent DX (developer experience)

**Supabase:**
- ✅ Postgres (mature, reliable)
- ✅ Built-in auth, storage, realtime
- ✅ Row-Level Security
- ✅ Generous free tier (bootstrap)
- ❌ Vendor lock-in (acceptable trade-off)

**Vercel:**
- ✅ Seamless Next.js integration
- ✅ Global CDN
- ✅ Automatic scaling
- ✅ Easy deployments
- ❌ Can get expensive (watch usage)

**TypeScript:**
- ✅ Type safety (catch bugs early)
- ✅ Better IDE support
- ✅ Self-documenting code
- ❌ Slight learning curve (worth it)

---

### 🚫 What We're NOT Using

**Not Using:**
- MongoDB (need relational DB)
- Firebase (prefer Supabase)
- AWS Amplify (too complex)
- GraphQL (REST is simpler for MVP)
- Redux (Zustand is lighter)

---

## 17.17. Future Tech Considerations

### 🔮 Phase 2+ Technologies

**Potential Additions:**
- GraphQL (if API becomes complex)
- Redis (caching layer)
- Elasticsearch (full-text search at scale)
- WebSockets (real-time collaboration)
- Message Queue (background jobs)

**AI/ML:**
- OpenAI API (document generation)
- Vector database (semantic search)
- ML models (case outcome prediction)

---

**Status:** ✅ Ready for Implementation  
**Owner:** CTO + Engineering Team  
**Next Review:** After MVP launch (adjust based on learnings)
