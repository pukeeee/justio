# Enterprise Architecture
## Next.js 16 CRM Platform

**Scalable, Portable, Testable Architecture**

---

**Дата створення:** 02.02.2026  
**Автор:** Senior System Architect  
**Версія:** 1.0

---

## 📋 Зміст

1. [Executive Summary](#executive-summary)
2. [Архітектурний огляд](#1-архітектурний-огляд)
3. [Вибір ORM: Drizzle vs Prisma](#2-вибір-orm-drizzle-vs-prisma)
4. [Структура проекту](#3-структура-проекту)
5. [Dependency Injection](#4-dependency-injection)
6. [Стратегія тестування](#5-стратегія-тестування)
7. [План міграції](#6-план-міграції)
8. [Best Practices](#7-best-practices)
9. [Майбутні можливості](#8-майбутні-можливості)
10. [Висновки](#9-висновки)

---

## Executive Summary

Цей документ описує **enterprise-рівня архітектуру** для Next.js 16 CRM проекту, розробленого з урахуванням принципів Clean Architecture, масштабованості та переносимості. Архітектура спроектована для поступового відходу від tight coupling з Supabase, з можливістю майбутнього розділення на окремі frontend та backend репозиторії.

### Ключові цілі

- ✅ Повна ізоляція інфраструктурних провайдерів (Supabase) через abstraction layer
- ✅ Логічне розділення frontend/backend вже зараз, фізичне — без переписування коду
- ✅ 100% тестованість бізнес-логіки без залежності від Supabase
- ✅ Підтримка міграції на будь-яку БД (PostgreSQL, MySQL, тощо)
- ✅ Можливість запуску backend в Docker контейнері

### Архітектурні принципи

| Принцип | Опис |
|---------|------|
| **Clean Architecture** | Концентричні шари з чіткими межами |
| **Dependency Inversion** | Залежності направлені всередину |
| **Single Responsibility** | Одна відповідальність на модуль |
| **Interface Segregation** | Мінімальні контракти між шарами |
| **Open/Closed** | Розширюваність без модифікації |

---

## 1. Архітектурний огляд

### 1.1 Шари архітектури

Проект організовано за принципами **Hexagonal Architecture** з чітким розділенням на концентричні шари. Кожен шар має чітко визначені межі відповідальності та взаємодіє з іншими тільки через інтерфейси.

#### Діаграма шарів (від центру до периферії):

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                   │
│    (Next.js App Router, API Routes)         │
├─────────────────────────────────────────────┤
│       Infrastructure Layer                   │
│  (Drizzle, Repositories, Auth Adapters)     │
├─────────────────────────────────────────────┤
│        Application Layer                     │
│      (Use Cases, DTOs, Ports)               │
├─────────────────────────────────────────────┤
│          Domain Layer                        │
│   (Entities, Value Objects, Rules)          │
└─────────────────────────────────────────────┘
```

**Шари:**

1. **Domain Layer** — бізнес-логіка, entities, business rules
2. **Application Layer** — use cases, бізнес-сценарії  
3. **Infrastructure Layer** — репозиторії, зовнішні сервіси
4. **Presentation Layer** — UI, API routes, controllers

> **⚠️ КРИТИЧНО ВАЖЛИВО**
> 
> Залежності ЗАВЖДИ направлені всередину:  
> `Domain ← Application ← Infrastructure ← Presentation`
> 
> Domain шар не знає нічого про БД, Framework, або UI.

### 1.2 Поточний стан vs Цільовий стан

| Поточний стан | Цільовий стан |
|--------------|---------------|
| ❌ Supabase SDK в сервісах | ✅ Drizzle ORM |
| ❌ Типи з Database | ✅ Domain-driven типи |
| ❌ Monolithic репозиторій | ✅ Розділені frontend/backend |
| ❌ Testing через Supabase | ✅ PostgreSQL в Docker |
| ❌ Tight coupling | ✅ Loose coupling через interfaces |
| ❌ Auth змішано з бізнес-логікою | ✅ Auth як окремий adapter |

---

## 2. Вибір ORM: Drizzle vs Prisma

### 2.1 Обґрунтування вибору

Після детального аналізу ваших вимог, **рекомендую DRIZZLE ORM** з наступних причин:

### 2.2 Переваги Drizzle

✅ **SQL-first підхід**: пишете SQL, отримуєте type-safety  
✅ **Zero overhead**: генерує чистий SQL без абстракцій  
✅ **Lightweight**: ~7KB vs 100KB+ у Prisma  
✅ **Повна підтримка PostgreSQL фічів** (RLS, functions, triggers)  
✅ **Drizzle Kit** для міграцій з auto-generate з існуючої БД  
✅ **Прямий доступ до SQL** для складних запитів  
✅ **Ідеально для вашого кейсу** з Supabase → PostgreSQL міграцією

### 2.3 Порівняльна таблиця

| Критерій | Drizzle | Prisma |
|----------|---------|--------|
| **Розмір** | ~7KB ✅ | ~100KB+ |
| **SQL контроль** | Повний ✅ | Обмежений |
| **Міграції** | Auto-generate ✅ | Manual |
| **PostgreSQL фічі** | Всі ✅ | Базові |
| **Testing** | PostgreSQL ✅ | PostgreSQL ✅ |
| **Type Safety** | Excellent ✅ | Excellent ✅ |
| **Performance** | Нативний SQL ✅ | Query builder overhead |
| **Learning Curve** | Steep (SQL knowledge) | Easy |
| **Community** | Growing | Large |

### 2.4 План міграції з Supabase

```bash
# Фаза 1: Встановлення
npm install drizzle-orm drizzle-kit
npm install @neondatabase/serverless # або pg для звичайного PostgreSQL

# Фаза 2: Генерація схеми з існуючої БД
npx drizzle-kit introspect:pg \
  --connectionString="postgresql://user:pass@host/db"

# Фаза 3: Створення міграцій
npx drizzle-kit generate:pg

# Фаза 4: Застосування міграцій
npx drizzle-kit push:pg
```

**Приклад Drizzle схеми:**

```typescript
// backend/infrastructure/database/drizzle/schema/clients.ts
import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  customFields: jsonb('custom_fields'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at')
});
```

---

## 3. Структура проекту

### 3.1 Рекомендована структура

```
src/
├── app/                      # Next.js App Router (Presentation Layer)
│   ├── (public)/            # Публічні сторінки
│   ├── (dashboard)/         # Захищені сторінки
│   └── api/                 # API Routes (HTTP adapters)
│
├── backend/                 # Backend логіка (Future: окремий repo)
│   ├── domain/              # Domain Layer
│   │   ├── entities/        # Бізнес-сутності
│   │   │   ├── client.entity.ts
│   │   │   ├── deal.entity.ts
│   │   │   └── workspace.entity.ts
│   │   ├── value-objects/   # Value Objects
│   │   │   ├── email.vo.ts
│   │   │   ├── phone.vo.ts
│   │   │   └── money.vo.ts
│   │   ├── events/          # Domain Events
│   │   │   ├── client-created.event.ts
│   │   │   └── deal-won.event.ts
│   │   └── errors/          # Domain errors
│   │       ├── domain-error.ts
│   │       └── quota-exceeded.error.ts
│   │
│   ├── application/         # Application Layer
│   │   ├── use-cases/       # Business scenarios
│   │   │   ├── client/
│   │   │   │   ├── create-client.use-case.ts
│   │   │   │   ├── update-client.use-case.ts
│   │   │   │   └── delete-client.use-case.ts
│   │   │   └── workspace/
│   │   │       └── create-workspace.use-case.ts
│   │   ├── dtos/            # Data Transfer Objects
│   │   │   ├── create-client.dto.ts
│   │   │   └── update-client.dto.ts
│   │   └── interfaces/      # Ports (абстракції)
│   │       ├── repositories/
│   │       │   ├── client.repository.interface.ts
│   │       │   └── workspace.repository.interface.ts
│   │       └── services/
│   │           ├── auth.service.interface.ts
│   │           └── storage.service.interface.ts
│   │
│   └── infrastructure/      # Infrastructure Layer
│       ├── database/        # Database implementations
│       │   ├── drizzle/     # Drizzle ORM config
│       │   │   ├── client.ts
│       │   │   ├── schema/  # Database schemas
│       │   │   └── migrations/
│       │   ├── repositories/# Repository implementations
│       │   │   ├── drizzle-client.repository.ts
│       │   │   └── drizzle-workspace.repository.ts
│       │   └── mappers/     # Domain ↔ Database mappers
│       │       ├── client.mapper.ts
│       │       └── deal.mapper.ts
│       ├── auth/            # Auth providers
│       │   ├── supabase-auth.adapter.ts
│       │   └── auth0-auth.adapter.ts (future)
│       ├── storage/         # File storage providers
│       │   ├── supabase-storage.adapter.ts
│       │   └── s3-storage.adapter.ts (future)
│       └── di/              # Dependency Injection
│           └── container.ts
│
├── frontend/                # Frontend-specific code
│   ├── features/            # Feature modules
│   │   ├── clients/
│   │   ├── deals/
│   │   └── workspaces/
│   ├── widgets/             # Complex UI components
│   │   ├── client-form/
│   │   └── deal-kanban/
│   ├── entities/            # UI entities
│   │   └── client-card/
│   └── shared/              # Shared UI code
│       ├── components/
│       ├── hooks/
│       └── stores/
│
└── shared/                  # Truly shared code
    ├── types/               # Shared TypeScript types
    ├── utils/               # Utility functions
    └── config/              # Configuration
```

### 3.2 Детальний опис директорій

---

#### 📁 `backend/domain/`

**Domain Layer** — серце бізнес-логіки, незалежне від фреймворків та БД.

##### ✅ МОЖНА:

- **Entities** (Client, Deal, Workspace)
- **Value Objects** (Email, Phone, Money)
- **Domain Events** (WorkspaceCreated, DealWon)
- **Business Rules** (validateQuota, calculateDiscount)
- **Domain Errors** (QuotaExceededError, InvalidEmailError)

##### ❌ КАТЕГОРИЧНО ЗАБОРОНЕНО:

- ❌ Будь-які імпорти Supabase SDK
- ❌ Будь-які імпорти Next.js
- ❌ Будь-які імпорти Drizzle/Prisma
- ❌ HTTP/REST/GraphQL логіка
- ❌ Прямі запити до БД

##### Приклад коду:

```typescript
// ✅ Правильно: Domain Entity
// backend/domain/entities/client.entity.ts

import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';
import { InvalidEmailError } from '../errors/invalid-email.error';

export class Client {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    private firstName: string,
    private lastName: string,
    private email: Email,
    private phone?: Phone,
    public readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  // Factory method
  static create(data: {
    id?: string;
    workspaceId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }): Client {
    return new Client(
      data.id ?? crypto.randomUUID(),
      data.workspaceId,
      data.firstName,
      data.lastName,
      Email.create(data.email),
      data.phone ? Phone.create(data.phone) : undefined
    );
  }

  // Business logic
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  changeEmail(newEmail: string): void {
    const emailVO = Email.create(newEmail);
    if (!emailVO.isValid()) {
      throw new InvalidEmailError(newEmail);
    }
    this.email = emailVO;
    this.updatedAt = new Date();
  }

  // Getters
  getEmail(): string {
    return this.email.value;
  }

  getPhone(): string | undefined {
    return this.phone?.value;
  }
}
```

```typescript
// ✅ Правильно: Value Object
// backend/domain/value-objects/email.vo.ts

export class Email {
  private constructor(public readonly value: string) {}

  static create(email: string): Email {
    const normalized = email.trim().toLowerCase();
    return new Email(normalized);
  }

  isValid(): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(this.value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

---

#### 📁 `backend/application/`

**Application Layer** — оркеструє виконання бізнес-сценаріїв (use cases).

##### ✅ МОЖНА:

- **Use Cases** (CreateContactUseCase, DeleteWorkspaceUseCase)
- **DTOs** (Data Transfer Objects)
- **Interfaces/Ports** для Infrastructure (IContactRepository)
- **Валідація** вхідних даних
- **Бізнес-оркестрація** (викликає domain методи)

##### ❌ КАТЕГОРИЧНО ЗАБОРОНЕНО:

- ❌ Прямі імпорти repositories implementations
- ❌ Supabase SDK
- ❌ Next.js специфічний код
- ❌ HTTP/REST логіка

##### Приклад коду:

```typescript
// ✅ Правильно: Repository Interface (Port)
// backend/application/interfaces/repositories/client.repository.interface.ts

import { Client } from '@/backend/domain/entities/client.entity';

export interface IContactRepository {
  findById(id: string): Promise<Client | null>;
  findByWorkspaceId(workspaceId: string): Promise<Client[]>;
  save(client: Client): Promise<Client>;
  delete(id: string): Promise<void>;
}
```

```typescript
// ✅ Правильно: Use Case з Dependency Injection
// backend/application/use-cases/client/create-client.use-case.ts

import { injectable, inject } from 'tsyringe';
import { Client } from '@/backend/domain/entities/client.entity';
import { IContactRepository } from '@/backend/application/interfaces/repositories/client.repository.interface';
import { IQuotaService } from '@/backend/application/interfaces/services/quota.service.interface';
import { QuotaExceededError } from '@/backend/domain/errors/quota-exceeded.error';
import { CreateContactDTO } from '@/backend/application/dtos/create-client.dto';

@injectable()
export class CreateContactUseCase {
  constructor(
    @inject('IContactRepository')
    private readonly contactRepository: IContactRepository,
    @inject('IQuotaService')
    private readonly quotaService: IQuotaService
  ) {}

  async execute(dto: CreateContactDTO): Promise<Client> {
    // 1. Перевірка квот
    const canCreate = await this.quotaService.canCreateContact(dto.workspaceId);
    if (!canCreate) {
      throw new QuotaExceededError('clients');
    }

    // 2. Створення domain entity
    const client = Client.create({
      workspaceId: dto.workspaceId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone
    });

    // 3. Збереження через interface (не знаємо про implementation)
    return await this.contactRepository.save(client);
  }
}
```

```typescript
// ✅ Правильно: DTO
// backend/application/dtos/create-client.dto.ts

export interface CreateContactDTO {
  workspaceId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
```

---

#### 📁 `backend/infrastructure/`

**Infrastructure Layer** — адаптери до зовнішнього світу (БД, API, файли).

##### ✅ МОЖНА:

- **Drizzle ORM** конфігурація
- **Repository implementations** (DrizzleContactRepository)
- **Auth adapters** (SupabaseAuthAdapter, Auth0Adapter)
- **Storage adapters** (S3StorageAdapter)
- **Міграції БД**
- **Mappers** (Domain ↔ Database)

##### ❌ КАТЕГОРИЧНО ЗАБОРОНЕНО:

- ❌ Бізнес-логіка (вона в domain/application)
- ❌ Next.js специфічний код
- ❌ UI компоненти

##### Приклад коду:

```typescript
// ✅ Правильно: Drizzle Client
// backend/infrastructure/database/drizzle/client.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Створюємо PostgreSQL connection
const queryClient = postgres(connectionString);

// Ініціалізуємо Drizzle
export const db = drizzle(queryClient, { schema });
```

```typescript
// ✅ Правильно: Repository Implementation
// backend/infrastructure/database/repositories/drizzle-client.repository.ts

import { injectable } from 'tsyringe';
import { eq, and } from 'drizzle-orm';
import { db } from '../drizzle/client';
import { clients } from '../drizzle/schema/clients';
import { Client } from '@/backend/domain/entities/client.entity';
import { IContactRepository } from '@/backend/application/interfaces/repositories/client.repository.interface';
import { ContactMapper } from '../mappers/client.mapper';

@injectable()
export class DrizzleContactRepository implements IContactRepository {
  async findById(id: string): Promise<Client | null> {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (result.length === 0) return null;
    
    return ContactMapper.toDomain(result[0]);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Client[]> {
    const result = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.workspaceId, workspaceId),
          eq(clients.deletedAt, null)
        )
      );

    return result.map(ContactMapper.toDomain);
  }

  async save(client: Client): Promise<Client> {
    const data = ContactMapper.toDatabase(client);
    
    const result = await db
      .insert(clients)
      .values(data)
      .returning();

    return ContactMapper.toDomain(result[0]);
  }

  async delete(id: string): Promise<void> {
    await db
      .update(clients)
      .set({ deletedAt: new Date() })
      .where(eq(clients.id, id));
  }
}
```

```typescript
// ✅ Правильно: Mapper
// backend/infrastructure/database/mappers/client.mapper.ts

import { Client } from '@/backend/domain/entities/client.entity';

type DbContact = {
  id: string;
  workspace_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export class ContactMapper {
  static toDomain(raw: DbContact): Client {
    return Client.create({
      id: raw.id,
      workspaceId: raw.workspace_id,
      firstName: raw.first_name,
      lastName: raw.last_name,
      email: raw.email,
      phone: raw.phone ?? undefined
    });
  }

  static toDatabase(client: Client): Omit<DbContact, 'created_at' | 'updated_at' | 'deleted_at'> {
    return {
      id: client.id,
      workspace_id: client.workspaceId,
      first_name: client.firstName,
      last_name: client.lastName,
      email: client.getEmail(),
      phone: client.getPhone() ?? null
    };
  }
}
```

---

#### 📁 `app/` (Next.js)

**Presentation Layer** — Next.js App Router, HTTP адаптери.

##### ✅ МОЖНА:

- **Server Components**
- **API Routes**
- **Server Actions**
- **Route Handlers**
- **Middleware**

##### ❌ КАТЕГОРИЧНО ЗАБОРОНЕНО:

- ❌ Бізнес-логіка (вона в backend/)
- ❌ Прямі запити до БД (через use cases)
- ❌ Складні обчислення

##### Приклад коду:

```typescript
// ✅ Правильно: API Route
// app/api/clients/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/backend/infrastructure/di/container';
import { CreateContactUseCase } from '@/backend/application/use-cases/client/create-client.use-case';
import { CreateContactSchema } from '@/shared/validations/client.schema';

export async function POST(request: NextRequest) {
  try {
    // 1. Парсинг body
    const body = await request.json();
    
    // 2. Валідація вхідних даних
    const dto = CreateContactSchema.parse(body);

    // 3. Виклик use case (через DI container)
    const useCase = container.resolve(CreateContactUseCase);
    const client = await useCase.execute(dto);

    // 4. Повернення результату
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    // 5. Обробка помилок
    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

```typescript
// ✅ Правильно: Server Action
// app/actions/client.actions.ts

'use server';

import { container } from '@/backend/infrastructure/di/container';
import { CreateContactUseCase } from '@/backend/application/use-cases/client/create-client.use-case';
import { revalidatePath } from 'next/cache';

export async function createContactAction(formData: FormData) {
  const useCase = container.resolve(CreateContactUseCase);
  
  const client = await useCase.execute({
    workspaceId: formData.get('workspaceId') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string | undefined
  });

  revalidatePath('/clients');
  
  return client;
}
```

---

#### 📁 `frontend/`

**Frontend код** — UI компоненти, features, entities (FSD методологія).

##### ✅ МОЖНА:

- **React компоненти**
- **Features** (форми, таблиці)
- **Widgets** (складні UI блоки)
- **Zustand stores**
- **API клієнти** (fetch wrappers)

##### ❌ КАТЕГОРИЧНО ЗАБОРОНЕНО:

- ❌ Бізнес-логіка
- ❌ Прямі запити до БД
- ❌ Supabase SDK (тільки через backend API)

---

## 4. Dependency Injection

### 4.1 Навіщо потрібен DI?

Dependency Injection забезпечує:

- ✅ **Слабку зв'язаність** між шарами
- ✅ **Тестованість** через підміну implementations
- ✅ **Гнучкість** при зміні провайдерів
- ✅ **Інверсію залежностей** (SOLID-D)

### 4.2 Рекомендація: TSyringe

Для вашого проекту рекомендую **TSyringe** — легкий DI контейнер для TypeScript.

**Переваги:**
- Простий API
- Decorator-based
- TypeScript native
- Малий розмір (~3KB)

**Встановлення:**

```bash
npm install tsyringe reflect-metadata
```

**Налаштування:**

```typescript
// backend/infrastructure/di/container.ts
import 'reflect-metadata';
import { container } from 'tsyringe';

// Infrastructure: Repositories
import { IContactRepository } from '@/backend/application/interfaces/repositories/client.repository.interface';
import { DrizzleContactRepository } from '@/backend/infrastructure/database/repositories/drizzle-client.repository';

container.register<IContactRepository>(
  'IContactRepository',
  { useClass: DrizzleContactRepository }
);

// Infrastructure: Services
import { IQuotaService } from '@/backend/application/interfaces/services/quota.service.interface';
import { QuotaService } from '@/backend/infrastructure/services/quota.service';

container.register<IQuotaService>(
  'IQuotaService',
  { useClass: QuotaService }
);

// Application: Use Cases
import { CreateContactUseCase } from '@/backend/application/use-cases/client/create-client.use-case';

container.register(CreateContactUseCase, {
  useClass: CreateContactUseCase
});

export { container };
```

**Використання:**

```typescript
// app/api/clients/route.ts
import { container } from '@/backend/infrastructure/di/container';
import { CreateContactUseCase } from '@/backend/application/use-cases/client/create-client.use-case';

export async function POST(request: Request) {
  const useCase = container.resolve(CreateContactUseCase);
  // Use case автоматично отримає dependencies через DI
  const result = await useCase.execute(dto);
  return NextResponse.json(result);
}
```

### 4.3 Testing з DI

```typescript
// tests/unit/create-client.use-case.spec.ts
import { container } from 'tsyringe';

describe('CreateContactUseCase', () => {
  beforeEach(() => {
    // Mock repository
    const mockRepository = {
      save: jest.fn().mockResolvedValue(mockContact)
    };

    container.registerInstance('IContactRepository', mockRepository);
  });

  it('should create client', async () => {
    const useCase = container.resolve(CreateContactUseCase);
    const result = await useCase.execute(mockDto);
    expect(result).toBeDefined();
  });
});
```

---

## 5. Стратегія тестування

### 5.1 Рівні тестування

| Рівень | Що тестуємо | Інструменти | Залежності |
|--------|-------------|-------------|------------|
| **Unit Tests** | Domain, Use Cases | Vitest + Mocks | ❌ Без БД |
| **Integration Tests** | Repositories | Vitest + Testcontainers | ✅ PostgreSQL в Docker |
| **E2E Tests** | User Flows | Playwright | ✅ Повний stack |

### 5.2 Unit Testing (Domain + Use Cases)

**Принципи:**
- ✅ Без залежностей від БД
- ✅ Без залежностей від framework
- ✅ Швидкі (<1ms на тест)
- ✅ Ізольовані (можна запускати паралельно)

**Приклад:**

```typescript
// tests/backend/domain/entities/client.spec.ts
import { describe, it, expect } from 'vitest';
import { Client } from '@/backend/domain/entities/client.entity';
import { InvalidEmailError } from '@/backend/domain/errors/invalid-email.error';

describe('Client Entity', () => {
  it('should create valid client', () => {
    const client = Client.create({
      workspaceId: 'ws-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });

    expect(client.getFullName()).toBe('John Doe');
    expect(client.getEmail()).toBe('john@example.com');
  });

  it('should throw error on invalid email', () => {
    expect(() => 
      Client.create({
        workspaceId: 'ws-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      })
    ).toThrow(InvalidEmailError);
  });

  it('should update email', () => {
    const client = Client.create({
      workspaceId: 'ws-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });

    client.changeEmail('newemail@example.com');
    expect(client.getEmail()).toBe('newemail@example.com');
  });
});
```

```typescript
// tests/backend/application/use-cases/create-client.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateContactUseCase } from '@/backend/application/use-cases/client/create-client.use-case';
import { IContactRepository } from '@/backend/application/interfaces/repositories/client.repository.interface';
import { IQuotaService } from '@/backend/application/interfaces/services/quota.service.interface';
import { QuotaExceededError } from '@/backend/domain/errors/quota-exceeded.error';

describe('CreateContactUseCase', () => {
  let useCase: CreateContactUseCase;
  let mockRepository: jest.Mocked<IContactRepository>;
  let mockQuotaService: jest.Mocked<IQuotaService>;

  beforeEach(() => {
    // Створюємо mocks
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByWorkspaceId: vi.fn(),
      delete: vi.fn()
    };

    mockQuotaService = {
      canCreateContact: vi.fn()
    };

    // Ін'єктуємо mocks в use case
    useCase = new CreateContactUseCase(mockRepository, mockQuotaService);
  });

  it('should create client when quota allows', async () => {
    // Arrange
    mockQuotaService.canCreateContact.mockResolvedValue(true);
    const mockContact = Client.create({
      workspaceId: 'ws-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });
    mockRepository.save.mockResolvedValue(mockContact);

    const dto = {
      workspaceId: 'ws-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result).toBeDefined();
    expect(mockQuotaService.canCreateContact).toHaveBeenCalledWith('ws-123');
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw QuotaExceededError when quota exceeded', async () => {
    // Arrange
    mockQuotaService.canCreateContact.mockResolvedValue(false);

    const dto = {
      workspaceId: 'ws-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(QuotaExceededError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
```

### 5.3 Integration Testing (Repositories)

**Принципи:**
- ✅ Реальна БД (PostgreSQL в Docker)
- ✅ Тестуємо SQL queries
- ✅ Тестуємо mappers
- ✅ Cleanup після кожного тесту

**Налаштування Testcontainers:**

```typescript
// tests/helpers/database.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

let container: StartedPostgreSqlContainer;
let db: ReturnType<typeof drizzle>;

export async function setupTestDatabase() {
  // Запускаємо PostgreSQL контейнер
  container = await new PostgreSqlContainer('postgres:16')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_pass')
    .start();

  // Підключаємось до БД
  const connectionString = container.getConnectionUri();
  const client = postgres(connectionString);
  db = drizzle(client);

  // Запускаємо міграції
  await migrate(db, { migrationsFolder: './migrations' });

  return { db, client };
}

export async function teardownTestDatabase() {
  await container.stop();
}

export async function cleanDatabase() {
  // Очистка всіх таблиць
  await db.delete(clients);
  await db.delete(deals);
  await db.delete(workspaces);
}
```

**Приклад тесту:**

```typescript
// tests/backend/infrastructure/repositories/drizzle-client.repository.spec.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, cleanDatabase } from '@/tests/helpers/database';
import { DrizzleContactRepository } from '@/backend/infrastructure/database/repositories/drizzle-client.repository';
import { Client } from '@/backend/domain/entities/client.entity';

describe('DrizzleContactRepository Integration Tests', () => {
  let repository: DrizzleContactRepository;
  let testDb: any;

  beforeAll(async () => {
    const { db } = await setupTestDatabase();
    testDb = db;
    repository = new DrizzleContactRepository(db);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should save and retrieve client', async () => {
    // Arrange
    const client = Client.create({
      workspaceId: 'ws-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });

    // Act
    await repository.save(client);
    const retrieved = await repository.findById(client.id);

    // Assert
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(client.id);
    expect(retrieved!.getFullName()).toBe('John Doe');
  });

  it('should find clients by workspace', async () => {
    // Arrange
    const contact1 = Client.create({
      workspaceId: 'ws-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });
    const contact2 = Client.create({
      workspaceId: 'ws-123',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    });

    await repository.save(contact1);
    await repository.save(contact2);

    // Act
    const clients = await repository.findByWorkspaceId('ws-123');

    // Assert
    expect(clients).toHaveLength(2);
  });

  it('should soft delete client', async () => {
    // Arrange
    const client = Client.create({
      workspaceId: 'ws-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });
    await repository.save(client);

    // Act
    await repository.delete(client.id);
    const retrieved = await repository.findById(client.id);

    // Assert
    expect(retrieved).toBeNull();
  });
});
```

### 5.4 E2E Testing (Playwright)

**Налаштування:**

```bash
npm install -D @playwright/test
npx playwright install
```

**Приклад:**

```typescript
// tests/e2e/clients.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test('should create new client', async ({ page }) => {
    await page.goto('/clients');
    
    await page.click('[data-testid="create-client-btn"]');
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.click('[type="submit"]');

    await expect(page.locator('text=John Doe')).toBeVisible();
  });
});
```

---

## 6. План міграції

### Поетапний перехід від Supabase до Drizzle

#### Фаза 1: Підготовка (1-2 тижні)

**Мета:** Налаштувати інструменти та середовище

- [ ] Встановити Drizzle ORM та Drizzle Kit
  ```bash
  npm install drizzle-orm drizzle-kit
  npm install @neondatabase/serverless # або pg
  npm install -D @testcontainers/postgresql
  ```

- [ ] Згенерувати схему з поточної Supabase БД
  ```bash
  npx drizzle-kit introspect:pg
  ```

- [ ] Налаштувати PostgreSQL в Docker для локальної розробки
  ```yaml
  # docker-compose.yml
  version: '3.8'
  services:
    postgres:
      image: postgres:16
      environment:
        POSTGRES_DB: crm_dev
        POSTGRES_USER: dev
        POSTGRES_PASSWORD: dev
      ports:
        - "5432:5432"
  ```

- [ ] Налаштувати Testcontainers для тестів
- [ ] Створити базову структуру директорій `backend/`

**Deliverables:**
- ✅ Drizzle schema згенеровано
- ✅ Docker PostgreSQL запущено
- ✅ Testcontainers налаштовано

---

#### Фаза 2: Domain Layer (2-3 тижні)

**Мета:** Створити core бізнес-логіку без залежностей

- [ ] Створити domain entities
  - Client
  - Deal
  - Workspace
  - User (WorkspaceMember)

- [ ] Створити value objects
  - Email
  - Phone
  - Money
  - Address

- [ ] Створити domain events (опціонально)
  - ContactCreated
  - DealWon
  - WorkspaceCreated

- [ ] Написати unit тести для всіх entities
  - 100% code coverage для domain
  - Тести на валідацію
  - Тести на бізнес-правила

- [ ] Переконатися що domain не має залежностей
  - Без імпортів Supabase
  - Без імпортів Next.js
  - Без імпортів Drizzle

**Deliverables:**
- ✅ Domain entities створено
- ✅ Value objects створено
- ✅ Unit тести написано (>95% coverage)
- ✅ Domain шар повністю ізольований

---

#### Фаза 3: Application Layer (2-3 тижні)

**Мета:** Створити бізнес-сценарії та інтерфейси

- [ ] Визначити interfaces/ports для repositories
  - IContactRepository
  - IDealRepository
  - IWorkspaceRepository

- [ ] Визначити interfaces для services
  - IAuthService
  - IStorageService
  - IQuotaService

- [ ] Створити DTOs
  - CreateContactDTO
  - UpdateContactDTO
  - тощо

- [ ] Створити use cases
  - CreateContactUseCase
  - UpdateContactUseCase
  - DeleteContactUseCase
  - (повторити для всіх entities)

- [ ] Написати unit тести з mocks
  - Тести на success scenarios
  - Тести на error scenarios
  - Тести на business rules

- [ ] Налаштувати DI контейнер (TSyringe)
  ```typescript
  container.register('IContactRepository', DrizzleContactRepository);
  ```

**Deliverables:**
- ✅ Interfaces створено
- ✅ Use cases створено
- ✅ DTOs створено
- ✅ Unit тести написано
- ✅ DI контейнер налаштовано

---

#### Фаза 4: Infrastructure Layer (3-4 тижні)

**Мета:** Імплементувати адаптери до БД та зовнішніх сервісів

- [ ] Імплементувати Drizzle repositories
  - DrizzleContactRepository
  - DrizzleDealRepository
  - DrizzleWorkspaceRepository

- [ ] Створити mappers (Domain ↔ Database)
  - ContactMapper
  - DealMapper
  - WorkspaceMapper

- [ ] Написати інтеграційні тести
  - Тести з PostgreSQL в Docker
  - Тести на CRUD операції
  - Тести на складні queries

- [ ] Створити auth adapters
  - SupabaseAuthAdapter (поки залишаємо Supabase для auth)
  - Можливість заміни на Auth0/Clerk в майбутньому

- [ ] Створити storage adapters
  - SupabaseStorageAdapter
  - Можливість заміни на S3/Cloudflare R2

**Deliverables:**
- ✅ Repositories імплементовано
- ✅ Mappers створено
- ✅ Integration тести написано
- ✅ Auth/Storage adapters створено

---

#### Фаза 5: Поступова заміна (4-6 тижнів)

**Мета:** Замінити Supabase SDK на use cases модуль за модулем

**Стратегія:** Strangler Fig Pattern

1. **Clients модуль (1 тиждень)**
   - [ ] Замінити прямі Supabase calls на use cases
   - [ ] Тестування
   - [ ] Deploy на staging
   - [ ] Моніторинг

2. **Deals модуль (1 тиждень)**
   - [ ] Те саме

3. **Workspaces модуль (1 тиждень)**
   - [ ] Те саме

4. **Tasks модуль (1 тиждень)**
   - [ ] Те саме

5. **Activities/Notes (1 тиждень)**
   - [ ] Те саме

6. **Auth (опціонально)**
   - [ ] Якщо потрібно, замінити Supabase Auth
   - [ ] Але можна залишити Supabase Auth як адаптер

**Підхід для кожного модуля:**

```typescript
// Старий код (видалити)
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('workspace_id', workspaceId);

// Новий код
const clients = await container
  .resolve(GetContactsUseCase)
  .execute({ workspaceId });
```

**Deliverables:**
- ✅ Всі модулі мігровано
- ✅ Supabase SDK видалено з бізнес-логіки
- ✅ Backwards compatibility збережено
- ✅ Performance не погіршився

---

#### Фаза 6: Фінал (1-2 тижні)

**Мета:** Cleanup та оптимізація

- [ ] Видалити останні залежності від Supabase SDK
  - Перевірити всі файли на наявність `@supabase/supabase-js`
  - Залишити тільки auth adapter

- [ ] Cleanup коду
  - Видалити unused imports
  - Видалити old repository files
  - Рефакторинг

- [ ] Оптимізація
  - Performance profiling
  - Query optimization
  - Index creation

- [ ] Фінальне тестування
  - Full regression testing
  - Load testing
  - Security audit

- [ ] Документація
  - Архітектурна документація
  - API документація
  - Developer guides

**Deliverables:**
- ✅ Code cleanup завершено
- ✅ Оптимізація виконана
- ✅ Всі тести проходять
- ✅ Документація оновлена

---

### Timeline Summary

| Фаза | Тривалість | Cumulative |
|------|-----------|------------|
| Фаза 1: Підготовка | 1-2 тижні | 2 тижні |
| Фаза 2: Domain | 2-3 тижні | 5 тижнів |
| Фаза 3: Application | 2-3 тижні | 8 тижнів |
| Фаза 4: Infrastructure | 3-4 тижні | 12 тижнів |
| Фаза 5: Міграція | 4-6 тижнів | 18 тижнів |
| Фаза 6: Фінал | 1-2 тижні | 20 тижнів |

**Загальна тривалість:** 4-5 місяців при full-time роботі

**Для solo developer:** 6-8 місяців з урахуванням паралельної підтримки production

---

## 7. Best Practices

### 7.1 SOLID Principles

#### S - Single Responsibility Principle

Кожен клас має одну причину для зміни.

```typescript
// ❌ Погано: клас робить занадто багато
class ContactService {
  createContact() { }
  updateContact() { }
  validateEmail() { }
  sendEmail() { }
  saveToDatabase() { }
}

// ✅ Добре: розділено на окремі класи
class CreateContactUseCase { }
class UpdateContactUseCase { }
class EmailValidator { }
class EmailService { }
class ContactRepository { }
```

#### O - Open/Closed Principle

Відкрито для розширення, закрито для модифікації.

```typescript
// ✅ Добре: можна додати нові implementations без зміни коду
interface IStorageService {
  upload(file: File): Promise<string>;
}

class SupabaseStorageAdapter implements IStorageService {
  async upload(file: File) { /* ... */ }
}

class S3StorageAdapter implements IStorageService {
  async upload(file: File) { /* ... */ }
}
```

#### L - Liskov Substitution Principle

Підкласи повинні бути взаємозамінними з базовими класами.

```typescript
// ✅ Добре: всі implementations відповідають контракту
interface IContactRepository {
  findById(id: string): Promise<Client | null>;
}

class DrizzleContactRepository implements IContactRepository {
  async findById(id: string): Promise<Client | null> {
    // Завжди повертає Client | null
  }
}
```

#### I - Interface Segregation Principle

Не залежати від інтерфейсів, які не використовуєш.

```typescript
// ❌ Погано: занадто широкий інтерфейс
interface IRepository {
  create();
  read();
  update();
  delete();
  export();
  import();
  validate();
}

// ✅ Добре: розділено на специфічні інтерфейси
interface IReadRepository {
  findById(id: string);
  findAll();
}

interface IWriteRepository {
  save(entity);
  delete(id);
}
```

#### D - Dependency Inversion Principle

Залежати від абстракцій, а не від конкретних implementations.

```typescript
// ✅ Добре: use case залежить від інтерфейсу
class CreateContactUseCase {
  constructor(
    private repository: IContactRepository // Interface, не implementation!
  ) {}
}
```

### 7.2 Naming Conventions

**Файли та директорії:**

```
✅ client.entity.ts          // Entity
✅ email.vo.ts                 // Value Object
✅ create-client.use-case.ts  // Use Case
✅ client.repository.interface.ts  // Interface
✅ drizzle-client.repository.ts    // Implementation
✅ client.mapper.ts           // Mapper
✅ quota-exceeded.error.ts     // Error
```

**Класи:**

```typescript
✅ Client                      // Entity (PascalCase)
✅ Email                        // Value Object
✅ CreateContactUseCase         // Use Case
✅ IContactRepository           // Interface (I prefix)
✅ DrizzleContactRepository     // Implementation
✅ ContactMapper                // Mapper
✅ QuotaExceededError          // Error (Error suffix)
```

**Константи:**

```typescript
✅ MAX_CONTACTS_FREE_TIER = 100
✅ DATABASE_URL = process.env.DATABASE_URL
```

**Функції:**

```typescript
✅ getContact()        // camelCase
✅ createContact()
✅ isEmailValid()
✅ canCreateContact()
```

### 7.3 Error Handling

**Ієрархія errors:**

```typescript
// Base domain error
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific domain errors
export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
  }
}

export class QuotaExceededError extends DomainError {
  constructor(entity: string) {
    super(`Quota exceeded for ${entity}`);
  }
}

// Application errors
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApplicationError {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]>
  ) {
    super(message);
  }
}

// Infrastructure errors
export class InfrastructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DatabaseError extends InfrastructureError { }
export class NetworkError extends InfrastructureError { }
```

**Error mapping в HTTP layer:**

```typescript
// app/api/clients/route.ts
export async function POST(request: Request) {
  try {
    const useCase = container.resolve(CreateContactUseCase);
    const result = await useCase.execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // Domain errors
    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof InvalidEmailError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Application errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, details: error.errors },
        { status: 422 }
      );
    }

    // Infrastructure errors
    if (error instanceof DatabaseError) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }

    // Unknown errors
    console.error('Unknown error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 7.4 Logging

**Structured logging:**

```typescript
// backend/infrastructure/logging/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// Usage
logger.info({ userId: '123', action: 'create_contact' }, 'Client created');
logger.error({ err: error, contactId: '456' }, 'Failed to create client');
```

**Correlation IDs:**

```typescript
// middleware/correlation-id.ts
import { v4 as uuidv4 } from 'uuid';

export function correlationIdMiddleware(request: Request) {
  const correlationId = request.headers.get('x-correlation-id') || uuidv4();
  
  // Додаємо до всіх логів
  logger.child({ correlationId });
  
  return correlationId;
}
```

### 7.5 Code Review Checklist

**Domain Layer:**
- [ ] Entities не залежать від infrastructure
- [ ] Value Objects immutable
- [ ] Business rules в domain entities
- [ ] 100% unit test coverage

**Application Layer:**
- [ ] Use cases залежать тільки від interfaces
- [ ] DTOs для всіх inputs
- [ ] Валідація на вході
- [ ] Error handling

**Infrastructure Layer:**
- [ ] Repositories реалізують interfaces
- [ ] Mappers для Domain ↔ Database
- [ ] Integration tests з реальною БД
- [ ] No business logic

**Presentation Layer:**
- [ ] Тільки HTTP mapping
- [ ] Валідація на вході
- [ ] Error mapping
- [ ] No business logic

---

## 8. Майбутні можливості

### 8.1 Розділення на окремі репозиторії

Після завершення міграції проект можна розділити на 3 окремі репозиторії:

#### Repository 1: `frontend-repo`

```
frontend-repo/
├── app/              # Next.js pages (тільки UI)
├── features/
├── widgets/
├── shared/
└── package.json
```

**Dependencies:**
- Next.js
- React
- Zustand
- Tailwind
- `@company/shared-types` (npm package)

#### Repository 2: `backend-repo`

```
backend-repo/
├── src/
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── tests/
└── package.json
```

**Deploy:** Може бути окремим API (Express/Fastify) або залишитись Next.js API routes

#### Repository 3: `shared-repo` (npm package)

```
shared-repo/
├── src/
│   ├── types/
│   ├── dtos/
│   └── errors/
└── package.json
```

**Published to:** npm private registry або GitHub packages

### 8.2 Containerization

**Backend Dockerfile:**

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**docker-compose для локальної розробки:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: crm_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://dev:dev@postgres:5432/crm_dev
      NODE_ENV: development
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### 8.3 Заміна БД

Завдяки abstraction layer, можна легко змінити БД:

#### PostgreSQL → MySQL

```typescript
// 1. Створити нову схему для MySQL
// backend/infrastructure/database/mysql/schema.ts

// 2. Створити MySQL repository implementation
class MySQLContactRepository implements IContactRepository {
  // Same interface, different implementation
}

// 3. Зареєструвати в DI
container.register('IContactRepository', MySQLContactRepository);
```

#### Multi-tenancy з окремими БД

```typescript
class TenantAwareContactRepository implements IContactRepository {
  constructor(private tenantId: string) {}

  async findById(id: string): Promise<Client | null> {
    const db = this.getTenantDatabase(this.tenantId);
    // Use tenant-specific database
  }

  private getTenantDatabase(tenantId: string) {
    // Return DB connection for specific tenant
  }
}
```

### 8.4 Масштабування

#### Horizontal Scaling

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
┌──────▼──────────┐
│  Load Balancer  │
└──────┬──────────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│ API │ │ API │ │ API │ │ API │
│  1  │ │  2  │ │  3  │ │  4  │
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │       │       │
   └───┬───┴───────┴───────┘
       │
┌──────▼──────────┐
│   PostgreSQL    │
│   (Primary)     │
└──────┬──────────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌──▼──┐
│Read │  │Read │
│Rep 1│  │Rep 2│
└─────┘  └─────┘
```

#### CQRS Pattern (опціонально)

```typescript
// Command side (writes)
interface IContactCommandRepository {
  save(client: Client): Promise<void>;
  delete(id: string): Promise<void>;
}

// Query side (reads)
interface IContactQueryRepository {
  findById(id: string): Promise<ContactDTO | null>;
  search(query: SearchQuery): Promise<ContactDTO[]>;
}

// Можна використовувати різні БД для command/query
// Command: PostgreSQL (transactional)
// Query: Elasticsearch (fast search)
```

#### Event Sourcing (якщо проект сильно виросте)

```typescript
// Замість збереження поточного стану, зберігаємо події
interface ContactEvent {
  type: 'ContactCreated' | 'EmailChanged' | 'ContactDeleted';
  timestamp: Date;
  data: any;
}

// Відновлення стану через replay подій
class Client {
  static fromEvents(events: ContactEvent[]): Client {
    const client = new Client();
    events.forEach(event => client.apply(event));
    return client;
  }

  apply(event: ContactEvent) {
    switch(event.type) {
      case 'ContactCreated':
        // ...
      case 'EmailChanged':
        // ...
    }
  }
}
```

---

## 9. Висновки

### 9.1 Що ми отримуємо

Запропонована архітектура забезпечує:

✅ **Повну незалежність від інфраструктурних провайдерів**
- Supabase ізольовано через адаптери
- Можна замінити на будь-який інший провайдер

✅ **100% тестованість бізнес-логіки**
- Domain та Application шари тестуються без БД
- Integration тести з реальним PostgreSQL
- E2E тести для критичних flows

✅ **Легку міграцію на будь-яку БД або cloud**
- Repository pattern ізолює БД
- Drizzle ORM дає повний контроль над SQL
- Mappers забезпечують чистий поділ

✅ **Можливість розділення на окремі frontend/backend репозиторії**
- Backend вже логічно відділений
- Shared types в окремому package
- API contracts чітко визначені

✅ **Enterprise-рівень якості без оверінжинірингу**
- Clean Architecture для великих проектів
- Але без зайвої складності для соло-розробника
- Patterns де потрібно, простота де можливо

✅ **Підтримку для одного розробника**
- Поетапна міграція (4-6 місяців)
- Можна тестувати кожен крок
- Backwards compatibility

### 9.2 Ключові переваги

| Характеристика | Опис |
|----------------|------|
| **Maintainability** | Легко змінювати та розширювати завдяки чітким межам |
| **Testability** | Кожен шар тестується ізольовано |
| **Portability** | Легко змінити БД, cloud провайдера, auth систему |
| **Scalability** | Готово до horizontal scaling, CQRS, microservices |
| **Future-proof** | Архітектура витримає зростання від MVP до enterprise |

### 9.3 Метрики успіху

Після завершення міграції ви зможете:

- [ ] Запустити всі тести без підключення до Supabase
- [ ] Замінити PostgreSQL на MySQL за 1 день
- [ ] Розділити проект на окремі repos за 1 тиждень
- [ ] Додати нову entity за 2-3 години
- [ ] Onboarding нового розробника за 1 день (замість тижня)

### 9.4 Наступні кроки

#### Immediate (тиждень 1-2):

1. **Створіть backup** поточного коду
   ```bash
   git checkout -b backup/pre-migration
   git push origin backup/pre-migration
   ```

2. **Створіть migration branch**
   ```bash
   git checkout -b feature/clean-architecture-migration
   ```

3. **Встановіть Drizzle**
   ```bash
   npm install drizzle-orm drizzle-kit
   ```

4. **Згенеруйте схему**
   ```bash
   npx drizzle-kit introspect:pg
   ```

#### Short-term (тиждень 3-8):

5. Створіть Domain Layer (entities, value objects)
6. Напишіть unit тести для domain
7. Створіть Application Layer (use cases, interfaces)
8. Налаштуйте DI контейнер

#### Mid-term (тиждень 9-18):

9. Імплементуйте Infrastructure Layer (repositories)
10. Напишіть integration тести
11. Почніть міграцію модулями (clients → deals → ...)
12. Continuous testing та monitoring

#### Long-term (тиждень 19-20):

13. Cleanup та оптимізація
14. Документація
15. Production deployment
16. Post-migration review

### 9.5 Підтримка документації

Ця архітектурна документація повинна бути **живим документом**:

- Оновлюйте при змінах в архітектурі
- Додавайте нові patterns та best practices
- Документуйте lessons learned
- Ведіть changelog

**Формат changelog:**

```markdown
## [2.0.0] - 2026-07-15
### Changed
- Migrated from Supabase SDK to Drizzle ORM
- Implemented Clean Architecture

### Added
- Repository pattern for database access
- Use cases for business logic
- Comprehensive testing strategy

### Removed
- Direct Supabase SDK usage in business logic
```

---

## 🎯 Фінальне слово

Ця архітектура не просто технічне рішення — це **інвестиція в майбутнє** вашого проекту.

Так, міграція забере 4-6 місяців. Але натомість ви отримаєте:

- 🚀 **Швидкість розробки** нових features (без страху зламати щось)
- 🛡️ **Впевненість** в якості коду (завдяки тестам)
- 🔄 **Гнучкість** при змінах вимог (dependency inversion)
- 📈 **Масштабованість** при зростанні (готова до enterprise)
- 👥 **Team-ready** (легко onboarding нових розробників)

**Успіхів у рефакторингу!** 

Ця архітектура зробить ваш проект професійним, підтримуваним та готовим до будь-яких викликів майбутнього.

---

**Автор:** Senior System Architect  
**Дата:** 02.02.2026  
**Версія:** 1.0  
**Ліцензія:** Proprietary
