# CRM SaaS — Повна технічна специфікація

**Версія:** 1.0  
**Дата:** 26 грудня 2025  
**Статус:** Ready for Development  

---

## 1. Product Vision

### 1.1 Місія продукту
Надати малому та середньому бізнесу в Україні доступний, простий у використанні CRM інструмент, який працює навіть без інтернету та інтегрується з локальними сервісами.

### 1.2 Цільова аудиторія

| Сегмент | Опис | Розмір команди | Pain Points |
|---------|------|----------------|-------------|
| **Мікробізнес** | Торгові точки, СТО, салони краси | 1-5 осіб | Excel/блокноти, забувають про клієнтів, немає історії |
| **Малий бізнес** | Невеликі магазини, клініки, B2B продажі | 5-20 осіб | Хаотичні процеси, втрата лідів, немає аналітики |
| **Середній бізнес** | Роздрібні мережі, дистриб'ютори | 20-100 осіб | Потрібна автоматизація, інтеграції, права доступу |

### 1.3 Ключові диференціатори

1. **Offline-first** — працює без інтернету (критично для України)
2. **Mobile-first** — 70%+ операцій через телефон
3. **Локальні інтеграції** — Нова Пошта "з коробки"
4. **Українська мова** — не просто переклад, а локалізація процесів
5. **Доступна ціна** — від 0 грн на старті

### 1.4 Продуктова стратегія

**Фази розвитку:**

```
MVP (3 міс) → Launch (6 міс) → Growth (12 міс) → Scale (24+ міс)
   ↓              ↓               ↓                ↓
Free tier    Paid plans      Marketplace      Enterprise
Core CRM     Інтеграції      API/Webhooks     White-label
```

### 1.5 Success Metrics

| Метрика | MVP Target | Launch Target | Growth Target |
|---------|-----------|---------------|---------------|
| MAU | 100 | 1,000 | 10,000 |
| Paying customers | 0 | 50 | 500 |
| MRR | $0 | $2,000 | $25,000 |
| Churn rate | — | <10% | <5% |
| NPS | — | 40+ | 50+ |

---

## 2. User Roles & Permissions

### 2.1 Ієрархія ролей

```
Owner (власник)
    ↓
Admin (адміністратор)
    ↓
Manager (менеджер)
    ↓
User (користувач)
    ↓
Guest (гість/читач)
```

### 2.2 Детальна матриця прав

| Функція | Owner | Admin | Manager | User | Guest |
|---------|-------|-------|---------|------|-------|
| **Організація** |
| Створити workspace | ✅ | ❌ | ❌ | ❌ | ❌ |
| Видалити workspace | ✅ | ❌ | ❌ | ❌ | ❌ |
| Редагувати налаштування | ✅ | ✅ | ❌ | ❌ | ❌ |
| Керувати підпискою | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Користувачі** |
| Запросити користувача | ✅ | ✅ | ❌ | ❌ | ❌ |
| Змінити роль | ✅ | ✅* | ❌ | ❌ | ❌ |
| Видалити користувача | ✅ | ✅* | ❌ | ❌ | ❌ |
| **Клієнти** |
| Створити клієнта | ✅ | ✅ | ✅ | ✅ | ❌ |
| Редагувати клієнта | ✅ | ✅ | ✅ | 🔶** | ❌ |
| Видалити клієнта | ✅ | ✅ | ✅ | ❌ | ❌ |
| Переглядати всіх клієнтів | ✅ | ✅ | ✅ | 🔶*** | 🔶*** |
| **Угоди** |
| Створити угоду | ✅ | ✅ | ✅ | ✅ | ❌ |
| Редагувати угоду | ✅ | ✅ | ✅ | 🔶** | ❌ |
| Видалити угоду | ✅ | ✅ | ✅ | ❌ | ❌ |
| Переглядати всі угоди | ✅ | ✅ | ✅ | 🔶*** | 🔶*** |
| **Завдання** |
| Створити завдання | ✅ | ✅ | ✅ | ✅ | ❌ |
| Призначити на іншого | ✅ | ✅ | ✅ | ❌ | ❌ |
| Редагувати завдання | ✅ | ✅ | ✅ | 🔶** | ❌ |
| **Продукти/Послуги** |
| Створити | ✅ | ✅ | ✅ | ❌ | ❌ |
| Редагувати | ✅ | ✅ | ✅ | ❌ | ❌ |
| Видалити | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Звіти** |
| Переглядати власні | ✅ | ✅ | ✅ | ✅ | ❌ |
| Переглядати всі | ✅ | ✅ | ✅ | ❌ | ❌ |
| Експортувати | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Інтеграції** |
| Налаштовувати | ✅ | ✅ | ❌ | ❌ | ❌ |
| Використовувати | ✅ | ✅ | ✅ | ✅ | ❌ |

**Легенда:**
- ✅ — Повний доступ
- ❌ — Немає доступу
- 🔶* — Не може змінювати Owner або Admin
- 🔶** — Тільки свої записи
- 🔶*** — Залежить від налаштувань видимості

### 2.3 Видимість даних

**ПРЕДПОЛОЖЕННЯ:** За замовчуванням застосовується модель "видимість по відповідальному".

| Роль | Видимість клієнтів | Видимість угод | Видимість завдань |
|------|-------------------|----------------|-------------------|
| Owner/Admin | Всі | Всі | Всі |
| Manager | Всі | Всі | Всі |
| User | Свої + призначені | Свої + призначені | Свої + призначені |
| Guest | За списком доступу | За списком доступу | Немає |

**Налаштування видимості (на рівні workspace):**
- `visibility_mode`: `"all"` | `"team"` | `"own"`
- `team_structure`: відділи/команди для `"team"` режиму

---

## 3. Functional Requirements

### 3.1 Core Modules (MVP)

#### 3.1.1 Управління клієнтами (Contacts/Companies)

**Entities:**

**Contact (Контакт — фізична особа)**
- ПІБ (обов'язкове)
- Телефон (основний + додаткові)
- Email (основний + додаткові)
- Компанія (зв'язок з Company)
- Посада
- Теги
- Джерело лідів
- Відповідальний (user_id)
- Статус: новий | кваліфікований | клієнт | втрачений
- Дата створення / оновлення
- Custom fields (JSON)

**Company (Компанія — юр. особа)**
- Назва (обов'язкове)
- ЄДРПОУ/ІПН
- Адреса (юридична, фактична)
- Телефон / Email
- Сайт
- Теги
- Відповідальний
- Статус
- Custom fields

**Функції:**
- CRUD операції
- Швидкий пошук (по імені, телефону, email)
- Фільтри (статус, теги, відповідальний, джерело)
- Імпорт CSV/Excel
- Експорт CSV/Excel
- Масові операції (зміна статусу, призначення відповідального)
- Історія взаємодій (timeline)
- Прикріплення файлів

#### 3.1.2 Управління угодами (Deals/Pipeline)

**Deal (Угода)**
- Назва
- Контакт/Компанія (зв'язок)
- Сума
- Валюта (UAH, USD, EUR)
- Етап (stage_id)
- Ймовірність закриття (%)
- Очікувана дата закриття
- Відповідальний
- Теги
- Продукти/послуги (багато до багатьох)
- Джерело
- Дата створення / закриття
- Custom fields

**Pipeline (Воронка продажів)**
- Назва
- Етапи (stages): масив об'єктів
  - id, name, order, probability, color
  - Дефолтні етапи: Лід → Кваліфікація → Пропозиція → Переговори → Закрито (виграно/програно)
- Можливість кастомізації етапів

**Функції:**
- Kanban-дошка для переміщення угод
- CRUD угод
- Фільтри (етап, відповідальний, сума, дата)
- Прогноз продажів (сума * ймовірність)
- Історія змін етапів
- Нотифікації при зміні етапу
- Автоматичні дії (на етапі переходу): створити завдання, відправити email (в майбутньому)

#### 3.1.3 Управління завданнями (Tasks)

**Task (Завдання)**
- Назва
- Опис
- Тип: дзвінок | зустріч | email | todo
- Пріоритет: низький | середній | високий
- Статус: заплановано | в роботі | виконано | скасовано
- Дедлайн (дата + час)
- Відповідальний (assigned_to)
- Зв'язані сутності: contact_id, company_id, deal_id
- Результат (після виконання)
- Створив (created_by)
- Дати створення / виконання

**Функції:**
- Створення завдань
- Календар завдань (день, тиждень, місяць)
- Список завдань (сортування, фільтри)
- Нагадування (за 15 хв, 1 год, 1 день)
- Push-нотифікації
- Швидке виконання завдання з мобілки
- Перенесення завдань (drag & drop)

#### 3.1.4 Продукти та послуги (Products)

**Product (Продукт/Послуга)**
- Назва
- Артикул (SKU)
- Опис
- Ціна
- Одиниця виміру
- Категорія
- Активний/неактивний
- Custom fields

**Функції:**
- CRUD операції
- Категорії (ієрархічні)
- Швидкий пошук при створенні угоди
- Прайс-листи (експорт)
- Історія змін ціни (аудит)

#### 3.1.5 Базова аналітика (Analytics)

**Дашборд:**
- Конверсія воронки (%)
- Кількість угод по етапах
- Сума угод по етапах
- Виконання плану (якщо встановлено)
- Топ-менеджери (по сумі/кількості угод)
- Джерела лідів (розподіл)
- Динаміка по датах (графік)

**Звіти:**
- По угодах (фільтри, експорт)
- По завданнях (виконання в строк)
- По клієнтах (нові, втрачені)
- По продуктах (найпопулярніші)

**Період:**
- Сьогодні / Тиждень / Місяць / Квартал / Рік / Довільний

### 3.2 Additional Modules (Post-MVP)

#### 3.2.1 Email-інтеграція
- Підключення пошти (IMAP/SMTP)
- Автоматичне створення контактів з email
- Збереження листування в timeline
- Відправка email з CRM

#### 3.2.2 SMS-інтеграція
- Відправка SMS через Kyivstar/Vodafone API
- Шаблони SMS
- Масова розсилка

#### 3.2.3 Нова Пошта
- Створення ТТН з угоди
- Відстеження статусу доставки
- Автоматичне оновлення статусу угоди

#### 3.2.4 Автоматизація
- Тригери (подія → дія)
- Workflows (складні ланцюжки)
- Сценарії продажів

#### 3.2.5 Документи
- Генерація договорів, рахунків
- Шаблони (з підстановкою змінних)
- ЕЦП (BankID інтеграція)

#### 3.2.6 Фінанси
- Рахунки (invoices)
- Платежі
- Інтеграція з банками (Monobank, ПриватБанк API)

### 3.3 Пріоритизація функцій (MoSCoW)

| Must Have (MVP) | Should Have (v1.5) | Could Have (v2.0) | Won't Have (поки) |
|-----------------|-------------------|------------------|-------------------|
| Клієнти CRUD | Email-інтеграція | Маркетингові кампанії | CRM для HoReCa |
| Компанії CRUD | SMS-інтеграція | Складський облік | ERP функції |
| Угоди + Pipeline | Нова Пошта | Проектний менеджмент | Бухгалтерія |
| Завдання + Календар | Документи | Телефонія | HR-модуль |
| Продукти | Рахунки | API для розробників | |
| Базова аналітика | Бази знань | Marketplace | |
| Користувачі + ролі | Звіти (розширені) | White-label | |
| Mobile PWA | Імпорт з інших CRM | | |
| Offline-sync | Автоматизація (базова) | | |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Метрика | Target | Acceptable | Critical |
|---------|--------|-----------|----------|
| **Web (Desktop)** |
| FCP (First Contentful Paint) | <1.5s | <2.5s | >3s |
| LCP (Largest Contentful Paint) | <2s | <3s | >4s |
| TTI (Time to Interactive) | <2.5s | <4s | >5s |
| **Mobile (3G)** |
| FCP | <2.5s | <4s | >5s |
| LCP | <3s | <4.5s | >6s |
| TTI | <4s | <6s | >8s |
| **API Response** |
| Читання (GET) | <100ms | <300ms | >500ms |
| Запис (POST/PUT) | <200ms | <500ms | >1s |
| Пошук | <150ms | <400ms | >700ms |
| **Database** |
| Запит (simple) | <50ms | <100ms | >200ms |
| Запит (join) | <100ms | <250ms | >500ms |
| Індекс покриття | >90% | >80% | <70% |
| **Offline Sync** |
| Локальне збереження | <50ms | <100ms | >200ms |
| Синхронізація (10 змін) | <2s | <5s | >10s |
| Конфлікт-резолюшн | <500ms | <1s | >2s |

### 4.2 Scalability

**MVP (Free Tier):**
- Користувачів на workspace: до 5
- Клієнтів: до 1,000
- Угод: до 500
- Записів в БД: до 10,000
- Файлів: до 1GB
- API calls: до 100,000/міс

**Paid Tier:**
- Користувачів: до 100
- Клієнтів: до 100,000
- Угод: до 50,000
- Записів в БД: до 1M
- Файлів: до 100GB
- API calls: до 10M/міс

**Target Architecture (VPS):**
- Користувачів: необмежено
- Горизонтальне масштабування
- Шардинг БД за workspace_id
- CDN для статики

### 4.3 Availability

| Tier | Uptime SLA | Max Downtime/міс | Support |
|------|-----------|------------------|---------|
| Free | 95% | ~36 год | Community |
| Starter | 99% | ~7 год | Email 48h |
| Pro | 99.5% | ~3.5 год | Email 24h |
| Enterprise | 99.9% | ~43 хв | Priority + Phone |

**ПРЕДПОЛОЖЕННЯ:** На MVP SLA не гарантується (best effort).

### 4.4 Security

**Authentication:**
- Email + Password (мінімум 8 символів, 1 велика, 1 цифра)
- OAuth2: Google, Microsoft (Post-MVP)
- 2FA: TOTP (Google Authenticator) — опціонально
- Session timeout: 7 днів (Remember Me) або 1 година

**Authorization:**
- Row Level Security (RLS) в Supabase
- Перевірка прав на рівні API
- Логування всіх змін (audit log)

**Data Protection:**
- Шифрування в transit: TLS 1.3
- Шифрування at rest: Supabase default (AES-256)
- Sensitive fields: додаткове шифрування (ключ в env)
- Резервні копії: щодня (Supabase)

**API Security:**
- Rate limiting: 100 req/min per user (Vercel Edge Config)
- CORS: тільки дозволені домени
- CSRF protection: Next.js default
- SQL Injection: Supabase Prepared Statements
- XSS: React auto-escape + DOMPurify для rich text

**Compliance:**
- Логування доступу до персональних даних
- Можливість видалення даних (GDPR)
- Export даних (GDPR)
- Cookie consent
- Privacy Policy + Terms of Service

### 4.5 Usability

**Mobile-first:**
- 60%+ користувачів на мобільних
- Всі основні функції доступні на телефоні
- Touch-friendly (мінімум 44×44px для кнопок)
- Жести: swipe to delete, pull to refresh

**Accessibility:**
- WCAG 2.1 Level AA (цільовий рівень)
- Keyboard navigation
- Screen reader support (ARIA labels)
- Контрастність: мінімум 4.5:1
- Font size: від 16px (мобілка)

**UX:**
- Максимум 3 кліки до будь-якої функції
- Швидкі дії (FAB на мобілці)
- Контекстні меню (довге натискання)
- Пошук: instant search (debounce 300ms)
- Автозбереження (draft)

### 4.6 Maintainability

**Code Quality:**
- TypeScript strict mode
- ESLint + Prettier
- Test coverage: >70% (цільовий)
- Документація: JSDoc для публічних функцій

**Architecture:**
- FSD (Feature-Sliced Design)
- Розділення concerns (UI / Logic / Data)
- Reusable components (shadcn/ui)
- Feature flags для rollout

**Monitoring:**
- Error tracking: Sentry (free tier)
- Analytics: Vercel Analytics
- Logs: Supabase Logs (7 днів на free tier)
- Alerts: критичні помилки → email

### 4.7 Compatibility

| Platform | Versions | Notes |
|----------|----------|-------|
| **Browsers** |
| Chrome | 90+ | Основний браузер (50% UA) |
| Firefox | 88+ | |
| Safari | 14+ | iOS webview |
| Edge | 90+ | |
| **Mobile** |
| iOS | 14+ | Safari WebKit |
| Android | 10+ | Chrome |
| **Screen Sizes** |
| Mobile | 360×640 - 428×926 | |
| Tablet | 768×1024 - 1024×1366 | |
| Desktop | 1280×720+ | |

**ПРЕДПОЛОЖЕННЯ:** IE11 не підтримується.

---

## 5. System Architecture

### 5.1 Architecture Overview

**Paradigm:** Hybrid (Server-First + Client-Side)

```
┌─────────────────────────────────────────────────────────┐
│                   Client (Browser/PWA)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Next.js    │  │  React RSC   │  │ Service      │  │
│  │  App Router  │  │  Components  │  │ Worker       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Zustand    │  │   Context    │  │  IndexedDB   │  │
│  │  (Business)  │  │  (UI/Auth)   │  │  (Offline)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Vercel Edge Network (CDN)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Static      │  │  Edge        │  │  Edge        │  │
│  │  Assets      │  │  Functions   │  │  Config      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            Next.js Server (Vercel Serverless)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Server     │  │   Server     │  │     API      │  │
│  │  Components  │  │   Actions    │  │    Routes    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Platform                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Postgres    │  │   Storage    │  │  Realtime    │  │
│  │  Database    │  │   (S3-like)  │  │  (WebSocket) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     Auth     │  │    Edge      │  │   Vectors    │  │
│  │  (GoTrue)    │  │  Functions   │  │  (pgvector)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                External Integrations                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Nova Poshta  │  │   SMS        │  │   Email      │  │
│  │     API      │  │  Provider    │  │   SMTP       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow Patterns

#### 5.2.1 Server-Side Rendering (SSR)

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = createServerClient() // Server Component
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .limit(10)
  
  return <DashboardView deals={deals} /> // Hydrated on client
}
```

**Pros:**
- SEO-friendly
- Швидкий FCP
- Безпека (API keys на сервері)

**Cons:**
- Не працює offline
- Slower TTI

**Use cases:** Landing pages, публічні сторінки, initial load

#### 5.2.2 Client-Side Fetch (CSR)

```typescript
// hooks/useDeals.ts
export function useDeals() {
  const [deals, setDeals] = useState([])
  
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.from('deals').select('*').then(setDeals)
  }, [])
  
  return deals
}
```

**Pros:**
- Інтерактивність
- Можна кешувати в IndexedDB

**Cons:**
- Повільніше
- Потрібен loader

**Use cases:** Дашборди, динамічні списки

#### 5.2.3 Server Actions

```typescript
// app/actions/deals.ts
'use server'

export async function createDeal(formData: FormData) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('deals')
    .insert({
      name: formData.get('name'),
      amount: formData.get('amount')
    })
  
  revalidatePath('/dashboard')
  return { data, error }
}

// Client usage
<form action={createDeal}>
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

**Pros:**
- Progressively enhanced
- Немає потреби в API endpoints
- Автоматична revalidation

**Cons:**
- Тільки для mutations

**Use cases:** Forms, CRUD операції

#### 5.2.4 Realtime Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('deals-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'deals' },
      (payload) => {
        // Update local state
        setDeals(prev => [...prev, payload.new])
      }
    )
    .subscribe()
  
  return () => channel.unsubscribe()
}, [])
```

**Use cases:** Collaborative editing, нотифікації

### 5.3 Offline-First Architecture

#### 5.3.1 Storage Layers

```
┌─────────────────────────────────────┐
│      Application State (RAM)        │
│     Zustand + React Context         │
└─────────────────────────────────────┘
              │ ▲
              ▼ │
┌─────────────────────────────────────┐
│     Client Cache (IndexedDB)        │
│   - Entities (contacts, deals)      │
│   - Media (images, files)           │
│   - Queue (pending operations)      │
└─────────────────────────────────────┘
              │ ▲
              ▼ │ Sync
┌─────────────────────────────────────┐
│    Server Database (Postgres)       │
│         Supabase                     │
└─────────────────────────────────────┘
```

#### 5.3.2 Sync Strategy

**Optimistic UI:**
```typescript
async function createContact(contact: Contact) {
  // 1. Додаємо локально (оптимістично)
  const tempId = `temp_${Date.now()}`
  addToLocalDb({ ...contact, id: tempId, _synced: false })
  updateUI(contact)
  
  // 2. Додаємо в чергу
  addToSyncQueue({ type: 'create', entity: 'contacts', data: contact })
  
  // 3. Намагаємось відправити на сервер (якщо online)
  if (navigator.onLine) {
    try {
      const { data } = await supabase.from('contacts').insert(contact)
      // 4. Оновлюємо локальну запис з реальним ID
      replaceInLocalDb(tempId, data.id)
      removeFromSyncQueue(tempId)
    } catch (error) {
      // Залишаємо в черзі, спробуємо пізніше
    }
  }
}
```

**Sync Queue:**
```typescript
interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'contacts' | 'deals' | 'tasks' | ...
  data: any
  timestamp: number
  retries: number
}
```

**Sync Process:**
1. При появі інтернету (online event)
2. Кожні 30 сек (background sync)
3. При відкритті додатку
4. Вручну (pull to refresh)

**Conflict Resolution:**
- Last Write Wins (за замовчуванням)
- Server version wins для критичних полів (сума угоди)
- Manual merge для складних конфліктів (показати обидві версії)

#### 5.3.3 Service Worker Strategy

```typescript
// service-worker.ts
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

// Static assets (HTML, CSS, JS)
precacheAndRoute(self.__WB_MANIFEST)

// API calls: Network First (with fallback to cache)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
  })
)

// Images: Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })
    ]
  })
)

// Supabase requests: Stale While Revalidate
registerRoute(
  ({ url }) => url.origin === 'https://your-project.supabase.co',
  new StaleWhileRevalidate({
    cacheName: 'supabase-cache',
  })
)
```

### 5.4 Free Tier Constraints & Workarounds

**Vercel Free Tier:**
- Serverless Functions: 100 GB-Hours/міс
- Bandwidth: 100 GB/міс
- Build time: 6000 хв/міс

**Обхід:**
- Використовувати Edge Functions (безлімітні execution time)
- Оптимізувати images (next/image + WebP)
- CDN caching (aggressive)

**Supabase Free Tier:**
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 5 GB/міс
- Monthly Active Users: 50,000
- Concurrent connections: 60

**Обхід:**
- Архівувати старі дані (soft delete + archive table)
- Стискати зображення перед завантаженням
- Використовувати CDN для файлів (Cloudflare R2 free tier)
- Connection pooling (Supavisor)

**Замість Redis (MVP):**
- Session storage: Supabase Auth (JWT)
- Cache: Vercel Edge Config (1KB free)
- Rate limiting: Edge Middleware + KV (в пам'яті)

**Замість RabbitMQ (MVP):**
- Черги: Supabase table `sync_queue`
- Background jobs: Supabase Edge Functions + pg_cron
- Webhooks: Supabase Webhooks (Database Triggers)

```sql
-- Sync queue table
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  retries INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Cron-like processing (via Edge Function called every minute)
-- Or use pg_cron extension if available
```

### 5.5 Target Architecture (VPS)

**Коли мігрувати:**
- >100 платних клієнтів
- >$5,000 MRR
- Перевищення free tier лімітів

**Stack:**
```
┌──────────────────────────────────────┐
│         Load Balancer (nginx)        │
└──────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    ▼                           ▼
┌─────────┐                 ┌─────────┐
│ Next.js │                 │ Next.js │
│  Node   │                 │  Node   │
└─────────┘                 └─────────┘
    │                           │
    └─────────────┬─────────────┘
                  ▼
    ┌─────────────────────────────┐
    │         Redis               │
    │  - Sessions                 │
    │  - Cache                    │
    │  - Rate limiting            │
    └─────────────────────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │      PostgreSQL             │
    │  - Master (read/write)      │
    │  - Replica (read-only)      │
    └─────────────────────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │      RabbitMQ/NATS          │
    │  - Background jobs          │
    │  - Webhooks                 │
    │  - Email queue              │
    └─────────────────────────────┘
```

**Migration Path:**
1. Експорт даних з Supabase (pg_dump)
2. Налаштування VPS (Docker Compose)
3. Імпорт даних
4. Оновлення env vars
5. DNS switch (zero downtime з blue-green deployment)

---

## 6. Data Model (Postgres)

### 6.1 Core Schema

#### 6.1.1 Multi-tenancy

```sql
-- Workspaces (Організації)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- для URL: crm.app/w/{slug}
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}', -- налаштування воронок, полів, тощо
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'starter', 'pro', 'enterprise'
  subscription_status TEXT DEFAULT 'active', -- 'active', 'past_due', 'cancelled'
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Користувачі workspace
CREATE TABLE workspace_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'owner', 'admin', 'manager', 'user', 'guest'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_users_workspace ON workspace_users(workspace_id);
CREATE INDEX idx_workspace_users_user ON workspace_users(user_id);
```

#### 6.1.2 Contacts & Companies

```sql
-- Компанії
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  legal_name TEXT,
  edrpou TEXT, -- ЄДРПОУ/ІПН
  website TEXT,
  industry TEXT,
  employees_count INT,
  annual_revenue NUMERIC(15,2),
  
  -- Addresses (JSONB для гнучкості)
  addresses JSONB DEFAULT '[]', -- [{type: 'legal', country, city, street, zip}, ...]
  
  -- Contact info
  phone TEXT,
  email TEXT,
  
  -- CRM fields
  status TEXT DEFAULT 'active', -- 'lead', 'active', 'inactive'
  tags TEXT[] DEFAULT '{}',
  source TEXT, -- 'website', 'referral', 'cold_call', ...
  owner_id UUID REFERENCES auth.users(id),
  
  -- Custom fields
  custom_fields JSONB DEFAULT '{}',
  
  -- Meta
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Контакти (фізичні особи)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    first_name || ' ' || last_name || COALESCE(' ' || middle_name, '')
  ) STORED,
  
  -- Contact details
  phones JSONB DEFAULT '[]', -- [{type: 'mobile', number: '+380...', primary: true}, ...]
  emails JSONB DEFAULT '[]',
  
  -- Job info
  position TEXT,
  department TEXT,
  
  -- CRM fields
  status TEXT DEFAULT 'new', -- 'new', 'qualified', 'customer', 'lost'
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  owner_id UUID REFERENCES auth.users(id),
  
  -- Social
  social_profiles JSONB DEFAULT '{}', -- {linkedin: '...', facebook: '...'}
  
  -- Custom fields
  custom_fields JSONB DEFAULT '{}',
  
  -- Meta
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Full-text search
CREATE INDEX idx_companies_search ON companies USING GIN(
  to_tsvector('simple', name || ' ' || COALESCE(legal_name, '') || ' ' || COALESCE(edrpou, ''))
);

CREATE INDEX idx_contacts_search ON contacts USING GIN(
  to_tsvector('simple', full_name || ' ' || COALESCE(position, ''))
);

CREATE INDEX idx_contacts_workspace ON contacts(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_workspace ON companies(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_owner ON contacts(owner_id) WHERE deleted_at IS NULL;
```

#### 6.1.3 Deals & Pipeline

```sql
-- Воронки продажів
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  stages JSONB NOT NULL, -- [{id, name, order, probability, color}, ...]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Угоди
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  stage_id TEXT NOT NULL, -- ID етапу з pipelines.stages
  
  -- Basic info
  title TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'UAH', -- 'UAH', 'USD', 'EUR'
  probability INT DEFAULT 50, -- 0-100
  
  -- Relations
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Dates
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Status
  status TEXT DEFAULT 'open', -- 'open', 'won', 'lost'
  lost_reason TEXT,
  
  -- Additional
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  custom_fields JSONB DEFAULT '{}',
  
  -- Meta
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Продукти в угоді (багато до багатьох)
CREATE TABLE deal_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  price NUMERIC(15,2) NOT NULL, -- Ціна на момент додавання
  discount NUMERIC(5,2) DEFAULT 0, -- Знижка %
  total NUMERIC(15,2) GENERATED ALWAYS AS (
    quantity * price * (1 - discount / 100)
  ) STORED,
  notes TEXT
);

-- Історія переміщень по етапах
CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id TEXT,
  to_stage_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  duration_seconds INT, -- Час на попередньому етапі
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deals_workspace ON deals(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_stage ON deals(stage_id) WHERE status = 'open';
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date) WHERE status = 'open';
```

#### 6.1.4 Tasks

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL, -- 'call', 'meeting', 'email', 'todo'
  
  -- Assignment
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  
  -- Timing
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Relations
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  
  -- Result
  result TEXT, -- Результат після виконання
  
  -- Reminders
  reminders JSONB DEFAULT '[]', -- [{time: '15m', sent: false}, ...]
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_assigned ON tasks(assigned_to, due_date) WHERE status != 'completed';
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status = 'pending';
```

#### 6.1.5 Products

```sql
-- Категорії продуктів (ієрархічні)
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Продукти/Послуги
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  
  -- Product info
  name TEXT NOT NULL,
  sku TEXT, -- Артикул
  description TEXT,
  
  -- Pricing
  price NUMERIC(15,2) NOT NULL,
  cost NUMERIC(15,2), -- Собівартість
  currency TEXT DEFAULT 'UAH',
  
  -- Inventory (опціонально)
  unit TEXT DEFAULT 'шт', -- 'шт', 'кг', 'л', 'год', 'м2'
  track_inventory BOOLEAN DEFAULT FALSE,
  stock_quantity INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Custom fields
  custom_fields JSONB DEFAULT '{}',
  
  -- Meta
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Історія змін ціни (для аудиту)
CREATE TABLE product_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price NUMERIC(15,2),
  new_price NUMERIC(15,2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_workspace ON products(workspace_id) WHERE is_active = TRUE;
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
```

#### 6.1.6 Activity Timeline (Interactions)

```sql
-- Історія взаємодій (універсальна таблиця)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Type
  activity_type TEXT NOT NULL, -- 'note', 'call', 'email', 'meeting', 'status_change', 'file_upload'
  
  -- Content
  subject TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}', -- Додаткові дані залежно від типу
  
  -- Relations (nullable для гнучкості)
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- User
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_contact ON activities(contact_id, created_at DESC);
CREATE INDEX idx_activities_company ON activities(company_id, created_at DESC);
CREATE INDEX idx_activities_deal ON activities(deal_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities(activity_type, created_at DESC);
```

#### 6.1.7 Files & Attachments

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- File info
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  
  -- Relations (nullable)
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Meta
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_files_workspace ON files(workspace_id);
CREATE INDEX idx_files_contact ON files(contact_id) WHERE deleted_at IS NULL;
```

#### 6.1.8 Notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification
  type TEXT NOT NULL, -- 'task_due', 'deal_stage_changed', 'mention', 'assigned'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT, -- URL для переходу
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;
```

### 6.2 Row Level Security (RLS)

**КРИТИЧНО:** Всі таблиці повинні мати RLS політики.

```sql
-- Enable RLS на всіх таблицях
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ... і так далі для всіх таблиць

-- Helper function: отримати workspace_ids користувача
CREATE OR REPLACE FUNCTION auth.user_workspaces(user_id UUID)
RETURNS TABLE(workspace_id UUID, role TEXT) AS $$
  SELECT workspace_id, role 
  FROM workspace_users 
  WHERE user_id = $1 AND status = 'active'
$$ LANGUAGE SQL STABLE;

-- Політика для contacts (приклад)
CREATE POLICY "Users can view contacts in their workspaces"
ON contacts FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM auth.user_workspaces(auth.uid())
  )
);

CREATE POLICY "Users can insert contacts in their workspaces"
ON contacts FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM auth.user_workspaces(auth.uid())
  )
);

CREATE POLICY "Users can update contacts in their workspaces"
ON contacts FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM auth.user_workspaces(auth.uid())
  )
);

-- Політика для видимості (залежно від налаштувань)
CREATE POLICY "Users see contacts based on visibility settings"
ON contacts FOR SELECT
USING (
  workspace_id IN (SELECT workspace_id FROM auth.user_workspaces(auth.uid()))
  AND (
    -- Owner/Admin/Manager бачать все
    (SELECT role FROM auth.user_workspaces(auth.uid()) WHERE workspace_id = contacts.workspace_id) IN ('owner', 'admin', 'manager')
    OR
    -- User бачить тільки свої записи
    owner_id = auth.uid()
  )
);
```

**ПРЕДПОЛОЖЕННЯ:** RLS політики мають бути написані для всіх таблиць аналогічно.

### 6.3 Database Triggers & Functions

```sql
-- Автоматичне оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Застосувати до всіх таблиць з updated_at

-- Створення активності при зміні статусу угоди
CREATE OR REPLACE FUNCTION log_deal_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO activities (
      workspace_id,
      activity_type,
      subject,
      content,
      deal_id,
      user_id,
      metadata
    ) VALUES (
      NEW.workspace_id,
      'status_change',
      'Статус угоди змінено',
      'Статус змінено з "' || OLD.status || '" на "' || NEW.status || '"',
      NEW.id,
      auth.uid(),
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deal_status_change_trigger AFTER UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION log_deal_status_change();

-- Автоматичне оновлення суми угоди при зміні продуктів
CREATE OR REPLACE FUNCTION update_deal_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE deals 
  SET amount = (
    SELECT COALESCE(SUM(total), 0) 
    FROM deal_products 
    WHERE deal_id = NEW.deal_id
  )
  WHERE id = NEW.deal_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deal_amount_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON deal_products
  FOR EACH ROW EXECUTE FUNCTION update_deal_amount();
```

### 6.4 Indexes Strategy

**ПРЕДПОЛОЖЕННЯ:** Індекси створюються для:
1. Foreign keys (автоматично)
2. Поля для фільтрації (status, tags, dates)
3. Поля для сортування (created_at, name)
4. Full-text search (GIN indexes)
5. JSONB поля (GIN indexes для custom_fields)

```sql
-- Приклад JSONB індекса
CREATE INDEX idx_contacts_custom_fields ON contacts USING GIN (custom_fields);

-- Partial index для активних записів
CREATE INDEX idx_contacts_active ON contacts(workspace_id) WHERE deleted_at IS NULL;

-- Composite index для частих запитів
CREATE INDEX idx_deals_workspace_status ON deals(workspace_id, status, created_at DESC);
```

### 6.5 Data Retention & Archival

**Soft Delete:**
- Всі основні таблиці мають `deleted_at TIMESTAMPTZ`
- При видаленні: `UPDATE ... SET deleted_at = NOW()`
- Querі завжди з `WHERE deleted_at IS NULL`

**Hard Delete (архівування):**
```sql
-- Таблиця для архіву
CREATE TABLE archived_contacts (
  LIKE contacts INCLUDING ALL
);

-- Функція архівування (виконується раз на місяць)
CREATE OR REPLACE FUNCTION archive_old_deleted_records()
RETURNS void AS $$
BEGIN
  -- Переносимо записи старше 6 місяців після soft delete
  INSERT INTO archived_contacts
  SELECT * FROM contacts 
  WHERE deleted_at < NOW() - INTERVAL '6 months';
  
  DELETE FROM contacts 
  WHERE deleted_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Виклик через pg_cron або Edge Function
```

---

## 7. API Design

### 7.1 API Architecture

**Підхід:** Next.js App Router (Server Actions + API Routes)

**Структура:**
```
app/
├── api/                    # REST API endpoints (для зовнішніх інтеграцій)
│   ├── webhooks/
│   │   └── nova-poshta/
│   │       └── route.ts
│   └── public/            # Public API (для майбутнього)
│       └── v1/
│           └── contacts/
│               └── route.ts
├── actions/               # Server Actions (для internal use)
│   ├── contacts.ts
│   ├── deals.ts
│   ├── tasks.ts
│   └── ...
└── (dashboard)/           # Protected routes
    └── ...
```

### 7.2 Server Actions (Internal API)

**Приклад: Contacts CRUD**

```typescript
// app/actions/contacts.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schema
const contactSchema = z.object({
  first_name: z.string().min(1, 'Обов\'язкове поле'),
  last_name: z.string().min(1, 'Обов\'язкове поле'),
  middle_name: z.string().optional(),
  phones: z.array(z.object({
    type: z.enum(['mobile', 'work', 'home']),
    number: z.string().regex(/^\+380\d{9}$/, 'Невірний формат'),
    primary: z.boolean()
  })).min(1),
  emails: z.array(z.object({
    type: z.enum(['work', 'personal']),
    email: z.string().email(),
    primary: z.boolean()
  })).optional(),
  company_id: z.string().uuid().optional(),
  position: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  custom_fields: z.record(z.any()).optional()
})

export type ContactInput = z.infer<typeof contactSchema>

export async function createContact(data: ContactInput) {
  try {
    // Валідація
    const validated = contactSchema.parse(data)
    
    // Supabase client
    const supabase = createServerClient()
    
    // Отримуємо поточного користувача
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Отримуємо workspace_id користувача
    const { data: workspace } = await supabase
      .from('workspace_users')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single()
    
    if (!workspace) {
      return { success: false, error: 'Workspace not found' }
    }
    
    // Створюємо контакт
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        ...validated,
        workspace_id: workspace.workspace_id,
        created_by: user.id,
        owner_id: validated.owner_id || user.id
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating contact:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate cache
    revalidatePath('/dashboard/contacts')
    
    // Створюємо активність
    await supabase.from('activities').insert({
      workspace_id: workspace.workspace_id,
      activity_type: 'note',
      subject: 'Контакт створено',
      content: `Створено новий контакт: ${validated.first_name} ${validated.last_name}`,
      contact_id: contact.id,
      user_id: user.id
    })
    
    return { success: true, data: contact }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Internal server error' }
  }
}

export async function updateContact(id: string, data: Partial<ContactInput>) {
  // Аналогічна логіка
}

export async function deleteContact(id: string) {
  const supabase = createServerClient()
  
  // Soft delete
  const { error } = await supabase
    .from('contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/dashboard/contacts')
  return { success: true }
}

export async function getContacts(filters?: {
  status?: string
  tags?: string[]
  owner_id?: string
  search?: string
}) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('contacts')
    .select('*, company:companies(id, name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }
  
  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id)
  }
  
  if (filters?.search) {
    // Full-text search
    query = query.textSearch('full_name', filters.search, {
      type: 'websearch',
      config: 'simple'
    })
  }
  
  const { data, error } = await query
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}
```

### 7.3 REST API (для зовнішніх інтеграцій)

**ПРЕДПОЛОЖЕННЯ:** REST API буде потрібен для:
- Webhooks (Нова Пошта, платіжні системи)
- Майбутній публічний API
- Інтеграції з третіми сторонами

```typescript
// app/api/webhooks/nova-poshta/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Webhook для оновлення статусу ТТН
export async function POST(request: NextRequest) {
  try {
    // Verify signature (Nova Poshta webhook)
    const signature = request.headers.get('x-np-signature')
    // ... перевірка підпису
    
    const body = await request.json()
    
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // Service role key
    )
    
    // Оновлюємо статус доставки в угоді
    const { data: deal } = await supabase
      .from('deals')
      .update({
        custom_fields: {
          ...body.custom_fields,
          np_status: body.status,
          np_tracking: body.tracking_number
        }
      })
      .eq('custom_fields->np_ttn', body.ttn_number)
      .select()
      .single()
    
    if (deal) {
      // Створюємо нотифікацію
      await supabase.from('notifications').insert({
        workspace_id: deal.workspace_id,
        user_id: deal.owner_id,
        type: 'delivery_update',
        title: 'Оновлення доставки',
        message: `ТТН ${body.ttn_number}: ${body.status}`,
        link: `/dashboard/deals/${deal.id}`
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Nova Poshta webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 7.4 Realtime Subscriptions

```typescript
// hooks/useRealtimeDeals.ts
import { useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useDealsStore } from '@/stores/deals'

export function useRealtimeDeals(workspaceId: string) {
  const { addDeal, updateDeal, removeDeal } = useDealsStore()
  
  useEffect(() => {
    const supabase = createBrowserClient()
    
    const channel = supabase
      .channel('deals-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deals',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => {
          addDeal(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deals',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => {
          updateDeal(payload.new.id, payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'deals',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => {
          removeDeal(payload.old.id)
        }
      )
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }, [workspaceId])
}
```

### 7.5 Error Handling

**Стандартний формат відповіді:**

```typescript
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

**Error codes:**
```typescript
const ErrorCodes = {
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  VALIDATION_ERROR: 'validation_error',
  WORKSPACE_LIMIT: 'workspace_limit_exceeded',
  SUBSCRIPTION_REQUIRED: 'subscription_required',
  RATE_LIMIT: 'rate_limit_exceeded',
  INTERNAL_ERROR: 'internal_error'
}
```

### 7.6 Rate Limiting

**Middleware:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limiter (для MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 100 // requests
const WINDOW_MS = 60 * 1000 // 1 minute

export function middleware(request: NextRequest) {
  const ip = request.ip || 'anonymous'
  const now = Date.now()
  
  const userLimit = rateLimitMap.get(ip)
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  } else if (userLimit.count >= RATE_LIMIT) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 }
    )
  } else {
    userLimit.count++
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

**ПРЕДПОЛОЖЕННЯ:** На VPS rate limiting буде через Redis.

---

## 8. Subscription & Billing Model

### 8.1 Pricing Tiers

| Tier | Price (UAH/міс) | Users | Contacts | Deals | Storage | Support |
|------|-----------------|-------|----------|-------|---------|---------|
| **Free** | 0 | 2 | 100 | 50 | 500 MB | Community |
| **Starter** | 299 | 5 | 5,000 | 1,000 | 5 GB | Email (48h) |
| **Pro** | 799 | 20 | 50,000 | 10,000 | 50 GB | Email (24h) + Chat |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | Unlimited | Priority + Phone + Onboarding |

**Додаткові модулі (платні):**
- Email-інтеграція: +99 грн/міс
- SMS (100 шт): +150 грн
- Нова Пошта (безлімітні ТТН): +199 грн/міс
- Автоматизація workflows: +299 грн/міс
- API доступ: +399 грн/міс
- White-label: +2,999 грн/міс

### 8.2 Quota Management

```sql
-- Квоти в налаштуваннях workspace
CREATE TABLE workspace_quotas (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id),
  max_users INT NOT NULL DEFAULT 2,
  max_contacts INT NOT NULL DEFAULT 100,
  max_deals INT NOT NULL DEFAULT 50,
  max_storage_mb INT NOT NULL DEFAULT 500,
  max_api_calls INT NOT NULL DEFAULT 1000,
  
  -- Current usage
  current_users INT DEFAULT 0,
  current_contacts INT DEFAULT 0,
  current_deals INT DEFAULT 0,
  current_storage_mb NUMERIC(10,2) DEFAULT 0,
  current_api_calls INT DEFAULT 0,
  
  -- Reset dates
  api_calls_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger для оновлення поточного використання
CREATE OR REPLACE FUNCTION update_workspace_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'contacts' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE workspace_quotas 
      SET current_contacts = current_contacts + 1
      WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE workspace_quotas 
      SET current_contacts = current_contacts - 1
      WHERE workspace_id = OLD.workspace_id;
    END IF;
  END IF;
  
  -- Аналогічно для deals, users, storage
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Перевірка квот в Server Actions:**

```typescript
async function checkQuota(workspaceId: string, quotaType: 'contacts' | 'deals' | 'users') {
  const supabase = createServerClient()
  
  const { data: quota } = await supabase
    .from('workspace_quotas')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()
  
  if (!quota) return false
  
  const limits = {
    contacts: quota.current_contacts >= quota.max_contacts,
    deals: quota.current_deals >= quota.max_deals,
    users: quota.current_users >= quota.max_users
  }
  
  return !limits[quotaType]
}
```

### 8.3 Платіжна інтеграція

**ПРЕДПОЛОЖЕННЯ:** Використовуємо:
1. **WayForPay** (Україна, найпопулярніший)
2. **Fondy** (альтернатива)
3. **Stripe** (для міжнародних платежів в майбутньому)

**Схема підписки:**

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  tier TEXT NOT NULL, -- 'free', 'starter', 'pro', 'enterprise'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'cancelled', 'trialing'
  
  -- Billing
  billing_period TEXT DEFAULT 'monthly', -- 'monthly', 'annual'
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'UAH',
  
  -- Dates
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  
  -- Payment provider
  payment_provider TEXT, -- 'wayforpay', 'fondy', 'stripe'
  external_subscription_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Історія платежів
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  
  payment_provider TEXT NOT NULL,
  external_payment_id TEXT,
  
  invoice_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Webhook обробка (WayForPay):**

```typescript
// app/api/webhooks/wayforpay/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Verify signature
  // ...
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  if (body.transactionStatus === 'Approved') {
    // Оновлюємо підписку
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString()
      })
      .eq('external_subscription_id', body.orderReference)
    
    // Записуємо платіж
    await supabase.from('payments').insert({
      subscription_id: body.orderReference,
      amount: body.amount,
      currency: body.currency,
      status: 'completed',
      payment_provider: 'wayforpay',
      external_payment_id: body.transactionId
    })
  }
  
  return NextResponse.json({ success: true })
}
```

### 8.4 Trial Period

**14 днів безкоштовно для Starter і Pro:**

```typescript
async function startTrial(workspaceId: string, tier: 'starter' | 'pro') {
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)
  
  await supabase.from('subscriptions').insert({
    workspace_id: workspaceId,
    tier,
    status: 'trialing',
    trial_ends_at: trialEnd.toISOString(),
    current_period_start: new Date().toISOString(),
    current_period_end: trialEnd.toISOString(),
    amount: 0
  })
  
  // Оновлюємо квоти відповідно до tier
  const quotas = {
    starter: { max_users: 5, max_contacts: 5000, max_deals: 1000 },
    pro: { max_users: 20, max_contacts: 50000, max_deals: 10000 }
  }
  
  await supabase
    .from('workspace_quotas')
    .update(quotas[tier])
    .eq('workspace_id', workspaceId)
}
```

### 8.5 Downgrade/Cancellation Policy

**При downgrade:**
- Дані зберігаються 30 днів
- Read-only доступ до "зайвих" записів
- Можливість експорту

**При cancellation:**
- Дані зберігаються 90 днів
- Можливість реактивації
- Експорт всіх даних

```typescript
async function handleSubscriptionCancellation(workspaceId: string) {
  // Soft delete: переводимо в read-only режим
  await supabase
    .from('workspaces')
    .update({
      subscription_tier: 'cancelled',
      subscription_status: 'cancelled',
      settings: {
        read_only: true,
        data_retention_until: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        ).toISOString()
      }
    })
    .eq('id', workspaceId)
  
  // Відправляємо email з інструкцією по експорту
  // ...
}
```

---

## 9. UX/UI Principles (Mobile-First)

### 9.1 Design System

**Кольорова схема:**
```typescript
// Based on shadcn/ui + custom UA theme
const colors = {
  primary: {
    50: '#eff6ff',  // Український блакитний
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  accent: {
    50: '#fefce8',  // Жовтий (акцент)
    500: '#eab308',
    900: '#713f12'
  },
  // ... інші кольори
}
```

**Типографія:**
- Font Family: Inter (без serif, добре читається на мобільних)
- Base size: 16px (мобілка), 14px (десктоп)
- Headings: 24px/20px/18px
- Line height: 1.5

**Spacing:**
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64

### 9.2 Mobile-First Components

#### 9.2.1 Navigation

**Bottom Tab Bar (мобілка):**
```
┌─────────────────────────────────┐
│                                 │
│         Content Area            │
│                                 │
├─────────────────────────────────┤
│ [Дашборд] [Угоди] [+] [Завд.] [☰]│
└─────────────────────────────────┘
```

**Sidebar (десктоп):**
```
┌──────┬──────────────────────────┐
│      │                          │
│ Nav  │    Content Area          │
│      │                          │
└──────┴──────────────────────────┘
```

#### 9.2.2 List Views

**Contact List (мобілка):**
```
┌─────────────────────────────────┐
│ 🔍 Пошук контактів...          │
├─────────────────────────────────┤
│ [Ім'я Прізвище]         [>]     │
│ ☎️ +380 XX XXX XX XX            │
│ 🏢 Компанія | 💼 Посада         │
├─────────────────────────────────┤
│ [Swipe for actions]             │
│  ← 📞 Call | ✏️ Edit | 🗑️ Delete →│
└─────────────────────────────────┘
```

**Infinite scroll + Pull to refresh**

#### 9.2.3 Forms

**Оптимізація для мобільних:**
- Auto-focus першого поля
- Правильні `inputMode` (`tel`, `email`, `numeric`)
- Автокомпліт де можливо
- Native date/time pickers
- Floating labels (більше простору)

```tsx
<Input
  type="tel"
  inputMode="tel"
  autoComplete="tel"
  pattern="[+]?[0-9]*"
  placeholder="+380"
/>
```

#### 9.2.4 Kanban Board (Deals)

**Мобілка:** Horizontal scroll по етапах
```
← [Лід] [Кваліф.] [Пропоз.] [Переговори] [Закрито] →
```

**Десктоп:** Grid layout
```
[Лід]      [Кваліф.]    [Пропоз.]   [Переговори]  [Закрито]
[Card 1]   [Card 3]     [Card 5]    [Card 7]      [Card 9]
[Card 2]   [Card 4]     [Card 6]    [Card 8]      [Card 10]
```

### 9.3 Touch Gestures

| Gesture | Action |
|---------|--------|
| Swipe right on list item | Дзвінок |
| Swipe left on list item | Видалити |
| Long press | Контекстне меню |
| Pull down | Refresh |
| Pull up | Load more |
| Pinch | Zoom (для зображень) |

### 9.4 Loading States

**Skeleton screens замість spinners:**

```tsx
// Contact Skeleton
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-8 w-3/4" />
  <Skeleton className="h-8 w-1/2" />
</div>
```

**Optimistic UI:**
- Показуємо зміни відразу
- Відкочуємо при помилці
- Toast повідомлення

### 9.5 Empty States

**Приклад:**
```
┌─────────────────────────────────┐
│                                 │
│          📋                     │
│                                 │
│   Поки що немає контактів       │
│                                 │
│   Натисніть "+" щоб додати      │
│   свій перший контакт           │
│                                 │
│      [+ Додати контакт]         │
│                                 │
└─────────────────────────────────┘
```

### 9.6 Accessibility

**WCAG 2.1 AA compliance:**
- Контрастність тексту: мінімум 4.5:1
- Touch targets: мінімум 44×44px
- Keyboard navigation на десктопі
- ARIA labels для screen readers
- Focus indicators
- Помилки форм: чітко помічені, описані

```tsx
<button
  aria-label="Створити новий контакт"
  className="min-h-[44px] min-w-[44px]"
>
  <Plus />
</button>
```

### 9.7 Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: '0px',     // 320px - 767px
  tablet: '768px',   // 768px - 1023px
  desktop: '1024px', // 1024px - 1279px
  wide: '1280px'     // 1280px+
}
```

**Tailwind config:**
```js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    }
  }
}
```

---

## 10. Offline-First / PWA Sync

### 10.1 PWA Configuration

**manifest.json:**
```json
{
  "name": "CRM SaaS",
  "short_name": "CRM",
  "description": "Ваша CRM система, яка працює без інтернету",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity"],
  "lang": "uk-UA"
}
```

### 10.2 IndexedDB Schema

```typescript
// lib/db/schema.ts
import Dexie, { Table } from 'dexie'

interface LocalContact {
  id: string
  workspace_id: string
  first_name: string
  last_name: string
  phones: any[]
  emails: any[]
  // ... всі поля з БД
  _synced: boolean
  _version: number
  _updated_at: string
}

interface SyncQueueItem {
  id: string
  entity_type: string
  operation: 'create' | 'update' | 'delete'
  entity_id: string
  data: any
  timestamp: number
  retries: number
}

class LocalDatabase extends Dexie {
  contacts!: Table<LocalContact, string>
  companies!: Table<LocalCompany, string>
  deals!: Table<LocalDeal, string>
  tasks!: Table<LocalTask, string>
  syncQueue!: Table<SyncQueueItem, string>
  
  constructor() {
    super('crm_local_db')
    
    this.version(1).stores({
      contacts: 'id, workspace_id, _synced, _updated_at, *tags',
      companies: 'id, workspace_id, _synced, _updated_at',
      deals: 'id, workspace_id, stage_id, _synced, _updated_at',
      tasks: 'id, workspace_id, assigned_to, due_date, _synced',
      syncQueue: 'id, entity_type, timestamp, retries'
    })
  }
}

export const db = new LocalDatabase()
```

### 10.3 Sync Manager

```typescript
// lib/sync/manager.ts
class SyncManager {
  private isOnline = navigator.onLine
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  
  constructor() {
    // Listen to online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
    
    // Start background sync
    this.startBackgroundSync()
  }
  
  private handleOnline() {
    this.isOnline = true
    console.log('🟢 Online: starting sync...')
    this.sync()
  }
  
  private handleOffline() {
    this.isOnline = false
    console.log('🔴 Offline mode')
  }
  
  private startBackgroundSync() {
    // Sync every 30 seconds if online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.sync()
      }
    }, 30000)
  }
  
  async sync() {
    if (this.isSyncing) return
    
    this.isSyncing = true
    
    try {
      // 1. Push local changes to server
      await this.pushChanges()
      
      // 2. Pull server changes
      await this.pullChanges()
      
      console.log('✅ Sync completed')
    } catch (error) {
      console.error('❌ Sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }
  
  private async pushChanges() {
    const queue = await db.syncQueue.toArray()
    
    for (const item of queue) {
      try {
        await this.processSyncItem(item)
        await db.syncQueue.delete(item.id)
      } catch (error) {
        console.error('Failed to sync item:', item, error)
        
        // Increment retry counter
        await db.syncQueue.update(item.id, {
          retries: item.retries + 1
        })
        
        // Give up after 5 retries
        if (item.retries >= 5) {
          await db.syncQueue.delete(item.id)
          // TODO: Notify user about failed sync
        }
      }
    }
  }
  
  private async processSyncItem(item: SyncQueueItem) {
    const supabase = createBrowserClient()
    
    switch (item.operation) {
      case 'create':
        const { data: created } = await supabase
          .from(item.entity_type)
          .insert(item.data)
          .select()
          .single()
        
        // Update local record with server ID
        if (item.entity_type === 'contacts') {
          await db.contacts.update(item.entity_id, {
            id: created.id,
            _synced: true,
            _version: created.version || 1
          })
        }
        break
      
      case 'update':
        await supabase
          .from(item.entity_type)
          .update(item.data)
          .eq('id', item.entity_id)
        
        if (item.entity_type === 'contacts') {
          await db.contacts.update(item.entity_id, {
            _synced: true
          })
        }
        break
      
      case 'delete':
        await supabase
          .from(item.entity_type)
          .delete()
          .eq('id', item.entity_id)
        
        if (item.entity_type === 'contacts') {
          await db.contacts.delete(item.entity_id)
        }
        break
    }
  }
  
  private async pullChanges() {
    const supabase = createBrowserClient()
    
    // Get last sync timestamp
    const lastSync = localStorage.getItem('last_sync_timestamp') || 
                     new Date(0).toISOString()
    
    // Fetch changed records
    const { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .gt('updated_at', lastSync)
    
    if (contacts) {
      for (const contact of contacts) {
        await this.mergeContact(contact)
      }
    }
    
    // Update last sync timestamp
    localStorage.setItem('last_sync_timestamp', new Date().toISOString())
  }
  
  private async mergeContact(serverContact: any) {
    const localContact = await db.contacts.get(serverContact.id)
    
    if (!localContact) {
      // New from server
      await db.contacts.add({
        ...serverContact,
        _synced: true,
        _version: serverContact.version || 1
      })
      return
    }
    
    // Conflict detection
    if (localContact._synced) {
      // No local changes, safe to update
      await db.contacts.put({
        ...serverContact,
        _synced: true,
        _version: serverContact.version || 1
      })
    } else {
      // Conflict! Local changes + server changes
      await this.resolveConflict(localContact, serverContact)
    }
  }
  
  private async resolveConflict(local: LocalContact, server: any) {
    // Strategy: Last Write Wins (server wins)
    console.warn('⚠️ Conflict detected:', local.id)
    
    // TODO: Implement smarter conflict resolution
    // For now: server wins
    await db.contacts.put({
      ...server,
      _synced: true,
      _version: server.version || 1
    })
    
    // Notify user about conflict
    // ...
  }
}

export const syncManager = new SyncManager()
```

### 10.4 Offline-Aware Hooks

```typescript
// hooks/useOfflineContacts.ts
export function useOfflineContacts() {
  const [contacts, setContacts] = useState<LocalContact[]>([])
  const [isOnline] = useOnlineStatus()
  
  useEffect(() => {
    loadContacts()
  }, [])
  
  async function loadContacts() {
    const localContacts = await db.contacts.toArray()
    setContacts(localContacts)
    
    // If online, trigger sync
    if (isOnline) {
      syncManager.sync()
    }
  }
  
  async function createContact(data: ContactInput) {
    const tempId = `temp_${Date.now()}`
    
    const newContact: LocalContact = {
      ...data,
      id: tempId,
      _synced: false,
      _version: 1,
      _updated_at: new Date().toISOString()
    }
    
    // Add to local DB immediately
    await db.contacts.add(newContact)
    
    // Add to sync queue
    await db.syncQueue.add({
      id: uuid(),
      entity_type: 'contacts',
      operation: 'create',
      entity_id: tempId,
      data,
      timestamp: Date.now(),
      retries: 0
    })
    
    // Update UI optimistically
    setContacts(prev => [...prev, newContact])
    
    // Trigger sync if online
    if (isOnline) {
      syncManager.sync()
    }
    
    return newContact
  }
  
  return { contacts, createContact }
}

// hooks/useOnlineStatus.ts
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return [isOnline, setIsOnline] as const
}
```

### 10.5 Service Worker Strategies

**Кешування стратегії:**

1. **Static Assets** — Cache First
   - HTML, CSS, JS
   - Images, fonts

2. **API Calls** — Network First, fallback to Cache
   - `/api/*`
   - Supabase calls

3. **User-Generated Content** — Stale While Revalidate
   - Avatars, uploads

```typescript
// service-worker.ts
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST)

// API calls: Network First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60 // 24 hours
      })
    ]
  })
)

// Supabase: Network First
registerRoute(
  ({ url }) => url.origin.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-cache',
    networkTimeoutSeconds: 5
  })
)

// Images: Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache'
  })
)

// App shell: Cache First
const handler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(handler)
registerRoute(navigationRoute)
```

### 10.6 Sync Indicators

**UI елементи:**

```tsx
// components/SyncIndicator.tsx
export function SyncIndicator() {
  const [isOnline] = useOnlineStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  
  useEffect(() => {
    // Count pending items
    db.syncQueue.count().then(setPendingCount)
  }, [isSyncing])
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <div className="h-2 w-2 rounded-full bg-green-500" />
          {isSyncing ? (
            <span>Синхронізація...</span>
          ) : pendingCount > 0 ? (
            <span>Очікує: {pendingCount}</span>
          ) : (
            <span>Синхронізовано</span>
          )}
        </>
      ) : (
        <>
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <span>Офлайн режим</span>
          {pendingCount > 0 && (
            <span className="text-muted-foreground">
              ({pendingCount} в черзі)
            </span>
          )}
        </>
      )}
    </div>
  )
}
```

---

## 11. Compliance & Legal

### 11.1 GDPR Compliance

**Основні вимоги:**

1. **Lawfulness, fairness, transparency**
   - Чітко пояснити, які дані збираємо і навіщо
   - Privacy Policy на українській мові
   - Cookie consent banner

2. **Purpose limitation**
   - Використовуємо дані тільки за призначенням
   - Не продаємо дані третім сторонам

3. **Data minimization**
   - Збираємо тільки необхідні дані
   - Опціональні поля позначені

4. **Accuracy**
   - Користувачі можуть редагувати свої дані
   - Логування змін (audit log)

5. **Storage limitation**
   - Автоматичне видалення через 90 днів після закриття акаунта
   - Архівування старих даних

6. **Integrity and confidentiality**
   - Шифрування (TLS + at-rest)
   - Обмеження доступу (RLS)
   - Регулярні резервні копії

7. **Accountability**
   - DPA (Data Processing Agreement) для клієнтів
   - Логування доступу до ПД

**Права суб'єктів даних:**

| Право | Реалізація |
|-------|-----------|
| **Right to access** | Експорт всіх даних (JSON/CSV) |
| **Right to rectification** | Редагування профілю |
| **Right to erasure** | "Видалити мій акаунт" |
| **Right to restrict processing** | Pause/Block акаунт |
| **Right to data portability** | Експорт в стандартних форматах |
| **Right to object** | Opt-out з маркетингових розсилок |

**Імплементація:**

```typescript
// app/actions/gdpr.ts
'use server'

export async function exportUserData(userId: string) {
  const supabase = createServerClient()
  
  // Collect all user data
  const { data: profile } = await supabase.auth.getUser()
  const { data: workspaces } = await supabase
    .from('workspace_users')
    .select('workspace:workspaces(*)')
    .eq('user_id', userId)
  
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('created_by', userId)
  
  // ... інші дані
  
  const exportData = {
    profile,
    workspaces,
    contacts,
    // ...
    exported_at: new Date().toISOString()
  }
  
  // Generate JSON file
  const fileName = `user_data_${userId}_${Date.now()}.json`
  const filePath = `/tmp/${fileName}`
  
  await fs.writeFile(filePath, JSON.stringify(exportData, null, 2))
  
  // Upload to Supabase Storage
  const { data: upload } = await supabase.storage
    .from('exports')
    .upload(fileName, filePath)
  
  // Send email with download link
  // ...
  
  return { success: true, downloadUrl: upload.path }
}

export async function deleteUserAccount(userId: string) {
  const supabase = createServerClient()
  
  // 1. Soft delete all user data
  await supabase
    .from('contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('created_by', userId)
  
  // 2. Remove from workspaces
  await supabase
    .from('workspace_users')
    .delete()
    .eq('user_id', userId)
  
  // 3. Anonymize user profile
  await supabase.auth.admin.updateUserById(userId, {
    email: `deleted_${userId}@deleted.local`,
    user_metadata: { deleted: true }
  })
  
  // 4. Schedule hard delete in 90 days
  await supabase.from('deletion_queue').insert({
    user_id: userId,
    delete_after: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  })
  
  return { success: true }
}
```

### 11.2 Закон України про захист персональних даних

**Відмінності від GDPR:**
- Реєстрація баз персональних даних (якщо >10,000 суб'єктів)
- Призначення відповідальної особи
- Повідомлення про витік даних протягом 72 годин

**Документація:**
- Політика конфіденційності (українською)
- Згода на обробку ПД (checkbox при реєстрації)
- Положення про обробку ПД

```tsx
// components/ConsentCheckbox.tsx
export function ConsentCheckbox() {
  return (
    <div className="flex items-start gap-2">
      <Checkbox id="consent" required />
      <label htmlFor="consent" className="text-sm">
        Я даю згоду на обробку моїх персональних даних відповідно до{' '}
        <a href="/privacy" className="underline">
          Політики конфіденційності
        </a>{' '}
        та Закону України "Про захист персональних даних"
      </label>
    </div>
  )
}
```

### 11.3 Cookie Policy

**Типи cookies:**

| Тип | Призначення | Термін | Згода |
|-----|-------------|--------|-------|
| **Необхідні** | Аутентифікація, сесія | 7 днів | Автоматично |
| **Функціональні** | Налаштування, мова | 1 рік | Опціонально |
| **Аналітичні** | Vercel Analytics | 1 рік | Опціонально |

**Cookie Banner:**

```tsx
// components/CookieBanner.tsx
export function CookieBanner() {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setShow(true)
  }, [])
  
  const accept = () => {
    localStorage.setItem('cookie_consent', 'all')
    setShow(false)
    // Enable analytics
  }
  
  const acceptNecessary = () => {
    localStorage.setItem('cookie_consent', 'necessary')
    setShow(false)
  }
  
  if (!show) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm">
          Ми використовуємо cookies для покращення вашого досвіду.{' '}
          <a href="/cookies" className="underline">
            Дізнатися більше
          </a>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={acceptNecessary}>
            Тільки необхідні
          </Button>
          <Button onClick={accept}>
            Прийняти всі
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 11.4 Terms of Service

**Основні розділи:**

1. **Предмет договору** — надання SaaS послуги
2. **Права та обов'язки сторін**
3. **Оплата** — тарифи, способи оплати
4. **Конфіденційність** — посилання на Privacy Policy
5. **Інтелектуальна власність** — copyright, ліцензія
6. **Обмеження відповідальності**
7. **Розірвання договору**
8. **Застосовне право** — законодавство України

### 11.5 Data Breach Response Plan

**Процедура при витоку даних:**

1. **Виявлення** (0-4 год)
   - Monitoring/alerting система
   - Логування доступу

2. **Оцінка** (4-24 год)
   - Які дані зачеплені?
   - Скільки користувачів?
   - Як стався витік?

3. **Стримування** (24-48 год)
   - Закрити вразливість
   - Змінити ключі/паролі
   - Блокувати доступ

4. **Повідомлення** (в межах 72 год)
   - Повідомити уповноваженого з ПД (Україна)
   - Email постраждалим користувачам
   - Публічна заява (якщо масштабно)

5. **Розслідування** (48 год - 2 тижні)
   - Root cause analysis
   - План запобігання

6. **Відновлення**
   - Патч/оновлення
   - Безкоштовний моніторинг кредитної історії (якщо витік фінансових даних)

**Шаблон повідомлення:**

```
Тема: Важливе повідомлення про безпеку вашого акаунта

Шановний користувач,

Ми виявили інцидент безпеки, який міг вплинути на ваш акаунт в CRM SaaS.

Що сталося:
[Опис інциденту]

Які дані могли бути зачеплені:
- Ім'я та email
- [Інші дані]

Що ми зробили:
- [Дії з виправлення]

Що рекомендуємо вам:
- Змініти пароль
- Увімкнути 2FA

За додатковою інформацією: security@crm-saas.com

З повагою,
Команда CRM SaaS
```

### 11.6 Security Measures (Технічні)

```typescript
// Приклад: Логування доступу до ПД
async function logDataAccess(
  userId: string,
  action: string,
  entityType: string,
  entityId: string
) {
  await supabase.from('audit_log').insert({
    user_id: userId,
    action, // 'view', 'create', 'update', 'delete', 'export'
    entity_type: entityType,
    entity_id: entityId,
    ip_address: request.ip,
    user_agent: request.headers['user-agent'],
    timestamp: new Date().toISOString()
  })
}

// Приклад: Rate limiting для експорту даних
const exportLimiter = new Map<string, number>()

async function checkExportLimit(userId: string) {
  const now = Date.now()
  const lastExport = exportLimiter.get(userId) || 0
  
  if (now - lastExport < 60 * 60 * 1000) {
    throw new Error('Ви можете експортувати дані лише раз на годину')
  }
  
  exportLimiter.set(userId, now)
}
```

---

## 12. MVP Scope

### 12.1 MVP Feature List

**✅ Must Have (MVP):**

**Автентифікація:**
- [ ] Реєстрація (email + password)
- [ ] Логін
- [ ] Відновлення пароля
- [ ] Email verification

**Workspace:**
- [ ] Створити workspace
- [ ] Запросити користувача (email)
- [ ] Базові ролі (Owner, User)

**Клієнти:**
- [ ] Створити контакт
- [ ] Редагувати контакт
- [ ] Видалити контакт (soft delete)
- [ ] Список контактів (фільтри, пошук)
- [ ] Деталі контакта (+ timeline)

**Компанії:**
- [ ] CRUD компаній
- [ ] Зв'язок контактів з компаніями

**Угоди:**
- [ ] Створити угоду
- [ ] Kanban дошка (переміщення між етапами)
- [ ] Додати продукти до угоди
- [ ] Закрити угоду (виграно/програно)

**Завдання:**
- [ ] Створити завдання
- [ ] Календар завдань
- [ ] Виконати завдання
- [ ] Нагадування (basic push)

**Продукти:**
- [ ] CRUD продуктів
- [ ] Пошук при створенні угоди

**Аналітика:**
- [ ] Дашборд (базові метрики)
- [ ] Конверсія воронки
- [ ] Топ-менеджери

**PWA:**
- [ ] Offline-first (IndexedDB)
- [ ] Service Worker
- [ ] Sync queue
- [ ] Push notifications (basic)

**UI:**
- [ ] Mobile-first дизайн
- [ ] Dark mode
- [ ] Українська мова

**❌ Not in MVP:**
- Email-інтеграція
- SMS
- Нова Пошта
- Автоматизація
- Документи
- Фінанси
- Розширена аналітика
- API
- Експорт/Імпорт (крім базового CSV)
- 2FA
- OAuth (Google/Microsoft)
- White-label

### 12.2 MVP Timeline

**Спринти (2 тижні кожен):**

**Sprint 1-2 (4 тижні): Foundation**
- [ ] Next.js 16 setup + FSD structure
- [ ] Supabase setup (DB, Auth, Storage)
- [ ] shadcn/ui + Tailwind config
- [ ] Authentication flow
- [ ] Workspace management
- [ ] RLS policies

**Sprint 3-4 (4 тижні): Core Features**
- [ ] Contacts CRUD
- [ ] Companies CRUD
- [ ] Deals + Pipeline
- [ ] Basic analytics dashboard

**Sprint 5-6 (4 тижні): Secondary Features**
- [ ] Tasks + Calendar
- [ ] Products
- [ ] Activity timeline
- [ ] File uploads

**Sprint 7-8 (4 тижні): Mobile + Offline**
- [ ] Mobile-first UI optimization
- [ ] PWA setup
- [ ] IndexedDB + Sync
- [ ] Service Worker

**Sprint 9 (2 тижні): Polish + Testing**
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] E2E tests
- [ ] User testing

**Sprint 10 (2 тижні): Pre-Launch**
- [ ] Legal docs (Privacy Policy, ToS)
- [ ] Landing page
- [ ] Onboarding flow
- [ ] Monitoring + Logging

**Total: 20 тижнів (5 місяців)**

### 12.3 MVP Success Criteria

**Технічні:**
- ✅ 90% offline functionality
- ✅ <2s load time (mobile 3G)
- ✅ Zero critical bugs
- ✅ 95% test coverage (Server Actions)

**Продуктові:**
- ✅ 10 active users (beta testers)
- ✅ Average session: >10 хв
- ✅ Daily active users: >50%
- ✅ NPS: >30

**Бізнесові:**
- ✅ Підтвердження problem-solution fit
- ✅ 5 платних beta customers (at discount)
- ✅ Готовність до масштабування

---

## 13. Risks & Edge Cases

### 13.1 Technical Risks

| Ризик | Ймовірність | Вплив | Mitigation |
|-------|-------------|-------|------------|
| **Supabase free tier limit** | Висока | Критичний | Моніторинг usage, архівування старих даних, готовність до міграції |
| **Vercel bandwidth limit** | Середня | Високий | Aggressive caching, optimize images, CDN |
| **Offline sync conflicts** | Висока | Середній | Last write wins + user notification, conflict resolution UI |
| **Browser storage quota** | Середня | Високий | Limit offline data (30 днів), cleanup old records |
| **Service Worker bugs** | Середня | Високий | Feature flag для SW, fallback до online-only |
| **Slow Next.js build time** | Низька | Середній | Incremental static regeneration, optimize dependencies |

### 13.2 Product Risks

| Ризик | Ймовірність | Вплив | Mitigation |
|-------|-------------|-------|------------|
| **Складність для малого бізнесу** | Висока | Критичний | Onboarding flow, video tutorials, шаблони |
| **Низький retention** | Середня | Критичний | Email-маркетинг, нагадування, value propositions |
| **Конкуренція (Bitrix24, etc)** | Висока | Високий | Фокус на offline-first, українську локалізацію, простоту |
| **Низька готовність платити** | Висока | Критичний | Free tier з обмеженнями, value-based pricing |
| **Потреба в інтеграціях** | Висока | Високий | Пріоритизувати найпопулярніші (Нова Пошта), API для решти |

### 13.3 Business Risks

| Ризик | Ймовірність | Вплив | Mitigation |
|-------|-------------|-------|------------|
| **Недостатньо коштів на масштабування** | Середня | Критичний | Bootstrapping, фокус на MRR, інвестори як last resort |
| **Проблеми з оплатою (WayForPay)** | Низька | Високий | Резервний gateway (Fondy), тестування перед запуском |
| **Юридичні проблеми (GDPR)** | Низька | Критичний | Консультація з юристом, чіткі ToS/Privacy Policy |
| **Брак команди** | Середня | Високий | Аутсорсинг не-критичних частин, фокус на MVP |

### 13.4 Edge Cases

**Дані:**
- [ ] Дуже довгі імена/назви (>1000 символів)
- [ ] Спеціальні символи (emoji, кирилиця в email)
- [ ] Null/undefined values в custom_fields
- [ ] Циклічні залежності (компанія → контакт → компанія)
- [ ] Видалення workspace з активними угодами

**Sync:**
- [ ] Конфлікт при зміні одного запису на 2 пристроях
- [ ] Синхронізація з поганим інтернетом (часткові запити)
- [ ] Переповнення sync queue (>1000 items)
- [ ] Зміна схеми БД під час offline (breaking changes)

**Permissions:**
- [ ] Зміна ролі на нижчу під час активної сесії
- [ ] Видалення користувача зі середини pipeline (reassign угоди)
- [ ] Owner покидає workspace (transfer ownership)
- [ ] Одночасний доступ до одного запису (race condition)

**Оплата:**
- [ ] Downgrade в середині місяця (пропорційне повернення?)
- [ ] Не пройшов платіж (grace period 7 днів)
- [ ] Відміна підписки відразу після оплати (refund?)
- [ ] Зміна валюти (UAH → USD) — recalculate?

**Тестування edge cases:**

```typescript
// __tests__/edge-cases.test.ts
describe('Edge Cases', () => {
  it('should handle very long contact names', async () => {
    const longName = 'a'.repeat(10000)
    const result = await createContact({
      first_name: longName,
      last_name: 'Test'
    })
    
    expect(result.error).toBeDefined() // Має бути валідаційна помилка
  })
  
  it('should resolve sync conflicts (last write wins)', async () => {
    const contact = await createContact({ first_name: 'John' })
    
    // Device 1: update offline
    await updateContactOffline(contact.id, { first_name: 'John Updated' })
    
    // Device 2: update offline
    await updateContactOffline(contact.id, { first_name: 'John Modified' })
    
    // Sync both
    await syncManager.sync()
    
    // Last update should win
    const synced = await getContact(contact.id)
    expect(synced.first_name).toBe('John Modified')
  })
  
  it('should handle workspace deletion with active deals', async () => {
    const workspace = await createWorkspace()
    const deal = await createDeal({ workspace_id: workspace.id })
    
    const result = await deleteWorkspace(workspace.id)
    
    // Should soft delete and archive
    expect(result.success).toBe(true)
    expect(result.archived_deals).toBe(1)
  })
})
```

---

## 14. Development Roadmap

### 14.1 Phase 1: MVP (Місяці 1-5)

**Мета:** Перевірити product-market fit з мінімальним набором функцій.

**Deliverables:**
- [ ] Working product на Vercel + Supabase
- [ ] 10 beta users
- [ ] Basic documentation
- [ ] Legal docs (Privacy Policy, ToS)

**Team:**
- 1 Fullstack Developer (Next.js + Supabase)
- 0.5 UI/UX Designer (контракт)

**Budget:** $0 (тільки час)

### 14.2 Phase 2: Launch (Місяці 6-8)

**Мета:** Публічний запуск, перші платні клієнти.

**Features:**
- [ ] Onboarding flow
- [ ] In-app help/docs
- [ ] Email notifications
- [ ] Basic integrations (Nova Poshta)
- [ ] CSV Import/Export
- [ ] User feedback система

**Marketing:**
- [ ] Landing page (SEO-optimized)
- [ ] Product Hunt launch
- [ ] Facebook/Instagram ads (малий бюджет)
- [ ] Ukrainian business forums
- [ ] YouTube demos

**Target:**
- 100 MAU
- 10 paying customers
- $500 MRR

**Budget:** $2,000 (ads, tools)

### 14.3 Phase 3: Growth (Місяці 9-12)

**Мета:** Масштабування до 1,000 користувачів, $5k MRR.

**Features:**
- [ ] Email integration
- [ ] SMS integration
- [ ] Advanced automation
- [ ] Mobile apps (React Native?)
- [ ] Advanced analytics
- [ ] Team collaboration features

**Infrastructure:**
- [ ] Migrate to paid Supabase tier
- [ ] Setup monitoring (Sentry, Datadog)
- [ ] CI/CD optimization
- [ ] Performance tuning

**Team:**
- +1 Backend Developer
- +1 Support (part-time)

**Budget:** $10,000 (infrastructure, team, ads)

### 14.4 Phase 4: Scale (Місяці 13-24)

**Мета:** Домінувати на українському ринку, розширення на Польщу/Румунію.

**Features:**
- [ ] Public API
- [ ] Marketplace (integrations)
- [ ] White-label
- [ ] Enterprise features (SSO, audit logs)
- [ ] Multi-language (Polish, English)

**Infrastructure:**
- [ ] Migrate to VPS (Hetzner/AWS)
- [ ] Redis + RabbitMQ
- [ ] Kubernetes (optional)
- [ ] Multi-region deployment

**Team:**
- +2 Developers
- +1 DevOps
- +1 Customer Success
- +1 Marketing

**Target:**
- 10,000 MAU
- 500 paying customers
- $25,000 MRR

**Budget:** $50,000 (team, infrastructure, marketing)

### 14.5 Milestones

```
Month 1  ▓░░░░░░░░░░  Setup + Auth
Month 2  ▓▓░░░░░░░░░  Core Features (Contacts, Companies)
Month 3  ▓▓▓░░░░░░░░  Deals + Pipeline
Month 4  ▓▓▓▓░░░░░░░  Tasks + Products + Analytics
Month 5  ▓▓▓▓▓░░░░░░  PWA + Offline + Polish → MVP DONE
Month 6  ▓▓▓▓▓▓░░░░░  Onboarding + Docs
Month 7  ▓▓▓▓▓▓▓░░░░  Nova Poshta + Marketing
Month 8  ▓▓▓▓▓▓▓▓░░░  Launch + First Customers
Month 9  ▓▓▓▓▓▓▓▓▓░░  Email/SMS Integrations
Month 10 ▓▓▓▓▓▓▓▓▓▓░ Automation + Advanced Features
Month 11 ▓▓▓▓▓▓▓▓▓▓▓ Mobile Apps (optional)
Month 12 ✅ 1000 users, $5k MRR
```

---

## 15. Migration Plan (MVP → VPS Scale)

### 15.1 When to Migrate

**Тригери міграції:**

| Метрика | Free Tier Limit | Current Usage | Action |
|---------|----------------|---------------|--------|
| **Database Size** | 500 MB | >400 MB | Upgrade to Supabase Pro OR Migrate |
| **Storage** | 1 GB | >800 MB | Upgrade OR Migrate |
| **API Requests** | 500k/міс | >400k/міс | Upgrade OR Migrate |
| **Concurrent Connections** | 60 | >50 | Upgrade OR Migrate |
| **MRR** | — | >$5,000 | Consider migration for cost optimization |

**ПРЕДПОЛОЖЕННЯ:** Міграція на VPS має економічний сенс при MRR >$5k (можна собі дозволити інфраструктуру).

### 15.2 Migration Strategy

**Підхід:** Blue-Green Deployment (zero downtime)

**Етапи:**

#### Stage 1: Preparation (1-2 тижні)
- [ ] Setup VPS (Hetzner/AWS/DigitalOcean)
- [ ] Install Docker + Docker Compose
- [ ] Provision Postgres, Redis, RabbitMQ
- [ ] Setup monitoring (Prometheus, Grafana)
- [ ] Configure backups

**VPS Stack:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
  
  rabbitmq:
    image: rabbitmq:3-management-alpine
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
  
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/crm
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

#### Stage 2: Data Migration (2-3 дні)
- [ ] Export data from Supabase (pg_dump)
- [ ] Import to new Postgres
- [ ] Verify data integrity
- [ ] Setup replication (Supabase → VPS) для sync

```bash
# Export from Supabase
pg_dump $SUPABASE_DATABASE_URL > backup.sql

# Import to VPS
psql $VPS_DATABASE_URL < backup.sql

# Verify
psql $VPS_DATABASE_URL -c "SELECT COUNT(*) FROM contacts;"
```

#### Stage 3: Application Updates (1 тиждень)
- [ ] Update database connection (Supabase → Postgres)
- [ ] Replace Supabase Auth з власним (NextAuth.js або Clerk)
- [ ] Replace Supabase Storage з S3/MinIO
- [ ] Replace Supabase Realtime з Socket.io + Redis Pub/Sub
- [ ] Update offline sync (endpoints)

**Code changes:**

```typescript
// Before (Supabase)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
await supabase.from('contacts').select('*')

// After (Direct Postgres)
import { Pool } from 'pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const result = await pool.query('SELECT * FROM contacts WHERE workspace_id = $1', [workspaceId])
```

**Realtime before/after:**

```typescript
// Before (Supabase Realtime)
supabase.channel('deals-changes')
  .on('postgres_changes', { ... }, callback)
  .subscribe()

// After (Socket.io + Redis)
io.on('connection', (socket) => {
  socket.on('subscribe:deals', (workspaceId) => {
    socket.join(`workspace:${workspaceId}`)
  })
})

// On deal update
await redis.publish(`workspace:${workspaceId}:deals`, JSON.stringify(deal))
```

#### Stage 4: Testing (1 тиждень)
- [ ] Load testing (Artillery/k6)
- [ ] Integration tests
- [ ] Manual QA
- [ ] Performance benchmarks

```bash
# Load test example (k6)
k6 run --vus 100 --duration 5m load-test.js
```

#### Stage 5: Gradual Rollout (1-2 тижні)
- [ ] 10% traffic to new VPS (via DNS or Load Balancer)
- [ ] Monitor errors, performance
- [ ] 50% traffic
- [ ] 100% traffic
- [ ] Деактивувати Supabase

**DNS-based rollout (Cloudflare):**
```
crm-saas.com → Load Balancer
  ├─ 10% → VPS (new)
  └─ 90% → Vercel (old)
```

#### Stage 6: Cleanup
- [ ] Export остаточних даних з Supabase
- [ ] Cancel Supabase subscription
- [ ] Update documentation
- [ ] Post-mortem meeting

### 15.3 Cost Comparison

**Free Tier (MVP):**
```
Vercel:      $0
Supabase:    $0
Domain:      $10/рік
Total:       ~$1/міс
```

**Paid Tier (Supabase Pro + Vercel Pro):**
```
Vercel Pro:     $20/міс
Supabase Pro:   $25/міс
Domain:         $1/міс
Total:          $46/міс
```

**VPS (Self-hosted):**
```
Hetzner VPS (CPX31): $15/міс (4 vCPU, 8GB RAM, 160GB SSD)
Cloudflare (CDN):     $0 (free tier)
Backups:              $5/міс
Monitoring (Sentry):  $26/міс (10k events)
Total:                $46/міс
```

**ПРЕДПОЛОЖЕННЯ:** На старті VPS і Supabase Pro коштують однаково, але VPS краще масштабується.

**При масштабуванні (1000+ користувачів):**
```
Supabase Pro + overages: $100-500/міс
VPS (dedicated): $100/міс + менеджмент
```

**Breakeven point:** ~500 активних користувачів / $5k MRR.

### 15.4 Rollback Plan

**Якщо міграція йде погано:**

1. **Immediate rollback** (< 1 година)
   - Switch DNS back to Vercel/Supabase
   - All traffic on old infrastructure

2. **Data sync** (1-2 години)
   - Sync changes made on VPS back to Supabase
   - Verify integrity

3. **Root cause analysis**
   - What went wrong?
   - Fix issues

4. **Retry migration**
   - Plan B or postpone

**Checkpoint system:**
- Before each stage: snapshot DB + Redis
- Rollback = restore snapshot

---

## 16. Cost Model (Free → Paid)

### 16.1 Free Tier Economics

**User acquisition cost (CAC):**
- Organic (SEO, Product Hunt): $0
- Paid ads: ~$10/user (Facebook/Google)
- Target: 70% organic, 30% paid

**Monthly cost per free user:**
```
Infrastructure:  $0 (free tier)
Support:         ~$0.50 (community forum)
Total:           $0.50/user/міс
```

**Sustainable free users:** До 10,000 (при використанні free tiers)

**Conversion funnel:**
```
1000 visitors → 100 signups (10%) → 10 active users (10%) → 1 paid (10%)
```

**Target conversion rate (free → paid):** 10% після 3 місяців використання

### 16.2 Paid Tier Economics

**Starter ($299 UAH / $7.50 USD):**
```
Revenue:           $7.50/міс
Infrastructure:    $1.50/міс (Supabase Pro share)
Support:           $1.00/міс (email)
Payment fees:      $0.30/міс (4%)
Total Cost:        $2.80/міс
Profit Margin:     $4.70/міс (63%)
```

**Pro ($799 UAH / $20 USD):**
```
Revenue:           $20/міс
Infrastructure:    $3/міс
Support:           $2/міс (priority)
Payment fees:      $0.80/міс
Total Cost:        $5.80/міс
Profit Margin:     $14.20/міс (71%)
```

**LTV (Lifetime Value):**
- Avg subscription length: 18 місяців (based on industry avg)
- Churn rate: 5%/міс
- LTV (Starter): $7.50 × 18 = $135
- LTV (Pro): $20 × 18 = $360

**CAC Payback Period:**
- Starter: $10 CAC / $4.70 profit = 2.1 місяці
- Pro: $10 CAC / $14.20 profit = 0.7 місяці

### 16.3 Unit Economics

**At scale (1000 paying customers):**

**Revenue:**
```
500 Starter × $7.50  = $3,750
400 Pro × $20        = $8,000
100 Enterprise (avg) = $10,000
Total MRR:             $21,750
Annual Run Rate:       $261,000
```

**Costs:**
```
Infrastructure:   $5,000/міс (VPS, CDN, backups)
Team (5 people):  $10,000/міс (Ukraine salaries)
Support:          $2,000/міс
Marketing:        $3,000/міс
Tools/SaaS:       $500/міс
Total:            $20,500/міс
Net Profit:       $1,250/міс (6% margin)
```

**ПРЕДПОЛОЖЕННЯ:** Low margin на початку через інвестиції в розвиток. Target: 20-30% margin.

### 16.4 Pricing Strategy

**Psychology:**
- Free tier: "foot in the door", habit formation
- Starter: "affordable upgrade", perfect for solo/micro businesses
- Pro: "professional tier", for teams
- Enterprise: "custom pricing", for large businesses

**Value-based pricing:**
- Starter: Saves ~5 годин/тиждень → $100/міс value → $7.50 pricing (13× ROI)
- Pro: Saves ~20 годин/тиждень → $400/міс value → $20 pricing (20× ROI)

**Anchoring:**
- Show annual pricing (2 місяці безкоштовно) → higher perceived value
- Cross-out "regular price" on landing page

**Price elasticity testing:**
- A/B test: $299 vs $349 UAH для Starter
- Measure conversion rate

### 16.5 Revenue Projections

**Conservative (Year 1):**
```
Month 1-3:   0 paying customers (MVP development)
Month 4-6:   10 customers → $75 MRR
Month 7-9:   50 customers → $500 MRR
Month 10-12: 100 customers → $1,500 MRR
Year 1 Total: $5,000 revenue
```

**Optimistic (Year 1):**
```
Month 6:  50 customers → $500 MRR
Month 12: 500 customers → $7,500 MRR
Year 1 Total: $30,000 revenue
```

**Target (Year 2):**
```
Month 18: 1,000 customers → $15,000 MRR
Month 24: 2,000 customers → $35,000 MRR
Year 2 Total: $300,000 revenue
```

### 16.6 Fundraising (Optional)

**Bootstrap first:** Aim for $5k MRR before considering investment.

**If needed:**
- Pre-seed: $50k-100k (Ukrainian angel investors, UVCA)
- Seed: $300k-500k (after $5k MRR, clear growth)

**Use of funds:**
- Team expansion (2-3 developers)
- Marketing ($20k budget)
- Infrastructure
- Legal/Compliance

**Dilution:** Target <20% for pre-seed, <25% for seed.

---

## Conclusion

Цей документ містить повну технічну та продуктову специфікацію для CRM SaaS продукту, готову до імплементації. Всі архітектурні рішення зроблені з урахуванням:

1. ✅ **Free tier constraints** — Працює на Vercel + Supabase безкоштовно
2. ✅ **Mobile-first** — UI/UX оптимізовані для мобільних пристроїв
3. ✅ **Offline-first** — IndexedDB + Service Worker + Sync Queue
4. ✅ **Ukrainian market** — Локалізація, Нова Пошта, GDPR + UA законодавство
5. ✅ **Scalability** — Чіткий шлях міграції на VPS
6. ✅ **Business viability** — Розрахунок unit economics, pricing strategy

**Наступні кроки:**
1. Створити GitHub репозиторій
2. Setup Next.js 16 + Supabase
3. Імплементувати FSD структуру
4. Почати з Sprint 1: Authentication + Workspaces

**Зауваження:** Всі інженерні предположення (ПРЕДПОЛОЖЕННЯ) чітко помічені в документі. При необхідності їх можна переглянути після MVP.

---

**Версія документа:** 1.0  
**Дата останнього оновлення:** 26 грудня 2025  
**Статус:** Ready for Development
