# Розділ 7: Дизайн API

Дизайн API охоплює як внутрішні механізми взаємодії між фронтендом і бекендом, так і зовнішні ендпоінти для інтеграцій. Ми використовуємо гібридний підхід, що поєднує Next.js Server Actions для внутрішніх операцій та традиційні API Routes для вебхуків.

Наша стратегія полягає у максимальному використанні **Server Actions** для всіх внутрішніх операцій зміни даних (CRUD). Це дозволяє нам уникнути створення повноцінного REST або GraphQL API, що значно спрощує архітектуру, зменшує кількість шаблонного коду та підвищує безпеку, оскільки бізнес-логіка не виноситься на окремі, потенційно вразливі, ендпоінти.

## 7.1. Архітектура API

*   **Внутрішній API (Server Actions):** Основний спосіб для зміни даних (CRUD). Server Actions дозволяють клієнтським компонентам безпечно викликати серверні функції, що спрощує архітектуру та зменшує кількість шаблонного коду.
*   **Зовнішній API (API Routes):** Використовується для обробки вебхуків від сторонніх сервісів (платіжні шлюзи, Нова Пошта) та, в майбутньому, для надання публічного API розробникам.

**Структура в проєкті:**
```
app/
├── api/                    # REST API ендпоінти
│   └── webhooks/
│       └── nova-poshta/
│           └── route.ts    # Обробник вебхуків від Нової Пошти
│
├── actions/                # Server Actions, згруповані за модулями
│   ├── contacts.ts
│   └── deals.ts
│
└── (dashboard)/            # Захищені роути
    └── ...
```

## 7.2. Внутрішній API: Server Actions

Це основний інструмент для всіх операцій, ініційованих користувачем в інтерфейсі.

**Приклад: CRUD для Контактів**

```typescript
// app/actions/contacts.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Схема валідації вхідних даних за допомогою Zod
const contactSchema = z.object({
  first_name: z.string().min(1, "Ім'я є обов'язковим полем"),
  last_name: z.string().min(1, "Прізвище є обов'язковим полем"),
  phones: z.array(z.object({
    type: z.enum(['mobile', 'work', 'home']),
    number: z.string().regex(/^\+380\d{9}$/, 'Невірний формат'),
  })).min(1, 'Потрібен хоча б один телефон'),
  // ... інші поля
});

export type ContactInput = z.infer<typeof contactSchema>;

// Server Action для створення контакту
export async function createContact(data: ContactInput) {
  try {
    // 1. Валідація вхідних даних
    const validated = contactSchema.parse(data);
    
    // 2. Ініціалізація серверного клієнта Supabase
    const supabase = createServerClient();
    
    // 3. Отримання поточного користувача та його організації
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Неавторизований доступ' };
    }
    const { data: workspace } = await supabase
      .from('workspace_users')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();
    
    if (!workspace) {
      return { success: false, error: 'Робочий простір не знайдено' };
    }

    // 4. Створення запису в базі даних
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        ...validated,
        workspace_id: workspace.workspace_id,
        created_by: user.id,
        owner_id: user.id // За замовчуванням, власник - той, хто створив
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // 5. Ревалідація кешу для миттєвого оновлення UI
    revalidatePath('/dashboard/contacts');
    
    // 6. Створення запису в історії активності (опціонально)
    await supabase.from('activities').insert({
      workspace_id: workspace.workspace_id,
      activity_type: 'note',
      content: `Створено новий контакт: ${validated.first_name} ${validated.last_name}`,
      contact_id: contact.id,
      user_id: user.id
    });
    
    return { success: true, data: contact };

  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, error: e.errors[0].message };
    }
    const error = e as Error;
    console.error('Помилка створення контакту:', error);
    return { success: false, error: 'Внутрішня помилка сервера' };
  }
}
```

## 7.3. Зовнішній API: API Routes для Вебхуків

Використовуються для прийому асинхронних сповіщень від зовнішніх систем.

```typescript
// app/api/webhooks/nova-poshta/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Обробник вебхука для оновлення статусу ТТН
export async function POST(request: NextRequest) {
  try {
    // Важливо: тут має бути логіка перевірки підпису вебхука від Нової Пошти
    const body = await request.json();
    
    // Використовуємо сервісний ключ Supabase для доступу до БД в обхід RLS
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    // Знаходимо та оновлюємо угоду за номером ТТН
    const { data: deal } = await supabase
      .from('deals')
      .update({ /* оновлюємо статус доставки */ })
      .eq('custom_fields->>np_ttn', body.ttn_number) // Приклад пошуку в JSONB
      .select('id, workspace_id, owner_id')
      .single();
      
    if (deal) {
      // Створюємо сповіщення для відповідального менеджера
      await supabase.from('notifications').insert({
        workspace_id: deal.workspace_id,
        user_id: deal.owner_id,
        type: 'delivery_update',
        message: `Статус доставки для ТТН ${body.ttn_number} оновлено: ${body.status}`,
        link: `/dashboard/deals/${deal.id}`
      });
    }
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Помилка обробки вебхука від Нової Пошти:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
```

## 7.4. Realtime API: Підписки на зміни

Для миттєвої синхронізації стану між клієнтами використовується Supabase Realtime. Це дозволяє оновлювати UI без перезавантаження сторінки, коли інший користувач вносить зміни.

```typescript
// hooks/useRealtimeDeals.ts
import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useDealsStore } from '@/stores/deals.store'; // Гіпотетичний Zustand store

export function useRealtimeDeals(workspaceId: string) {
  const { addDeal, updateDeal, removeDeal } = useDealsStore();
  
  useEffect(() => {
    const supabase = createBrowserClient();
    
    const channel = supabase
      .channel(`realtime-deals-${workspaceId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deals', filter: `workspace_id=eq.${workspaceId}`},
        (payload) => {
          addDeal(payload.new);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'deals', filter: `workspace_id=eq.${workspaceId}`},
        (payload) => {
          updateDeal(payload.new.id, payload.new);
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'deals', filter: `workspace_id=eq.${workspaceId}`},
        (payload) => {
          removeDeal(payload.old.id);
        }
      )
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [workspaceId, addDeal, updateDeal, removeDeal]);
}
```

## 7.5. Обробка Помилок

*   **Формат відповіді:** Усі відповіді API дотримуються єдиного формату для зручності обробки на клієнті.
    ```typescript
    type ApiResponse<T> = 
      | { success: true; data: T }
      | { success: false; error: string; code?: string };
    ```
*   **Коди помилок:** Для стандартизації використовуються коди помилок.
    ```typescript
    const ErrorCodes = {
      UNAUTHORIZED: 'unauthorized',
      FORBIDDEN: 'forbidden',
      NOT_FOUND: 'not_found',
      VALIDATION_ERROR: 'validation_error',
      RATE_LIMIT: 'rate_limit_exceeded',
      INTERNAL_ERROR: 'internal_error'
    }
    ```

## 7.6. Обмеження Запитів (Rate Limiting)

Для захисту від зловживань на публічні ендпоінти буде застосовано обмеження кількості запитів. На етапі MVP це реалізується через простий in-memory-лімітер у Next.js Middleware.

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Зберігаємо лічильники в пам'яті (для MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 100 // кількість запитів
const WINDOW_MS = 60 * 1000 // за 1 хвилину

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1'
    const now = Date.now()
    
    const userLimit = rateLimitMap.get(ip)
    
    if (!userLimit || now > userLimit.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    } else if (userLimit.count >= RATE_LIMIT) {
      return NextResponse.json(
        { success: false, error: 'Забагато запитів', code: 'RATE_LIMIT' },
        { status: 429 }
      )
    } else {
      userLimit.count++
    }
  }
  
  return NextResponse.next()
}
```

## 7.7. Взаємодія з зовнішніми API

Щоб ізолювати систему від змін у сторонніх сервісах, усі виклики до зовнішніх API інкапсулюються у спеціальні сервісні модулі (патерн "Адаптер").

*   **Приклад для «Нова Пошта»:**
    Створюється сервіс `NovaPoshtaService`, який має методи на кшталт `createShipment(data)` та `trackShipment(ttn)`. Уся логіка роботи з API «Нова Пошта» (авторизація, формування тіла запиту, обробка відповідей) знаходиться всередині цього сервісу. Решта коду викликає лише ці прості методи. Якщо «Нова Пошта» оновить свій API, зміни потрібно буде внести лише в цей файл.

*   **Приклад для Email-сервісу:**
    Аналогічно створюється `EmailService` з методом `sendTransactionalEmail(to, subject, body)`. Цей сервіс може використовувати будь-який провайдер (SendGrid, Postmark) "під капотом", і його заміна не вплине на інший код.

## 7.8. Приклади сценаріїв роботи API

*   **Сценарій "Створення нового контакту":**
    1.  Користувач заповнює форму на клієнті і натискає "Зберегти".
    2.  Форма викликає Server Action `createContact`, передаючи дані.
    3.  На сервері `createContact` валідує дані (через Zod).
    4.  Отримує `user_id` та `workspace_id` з поточної сесії.
    5.  Створює запис у таблиці `contacts` в базі даних.
    6.  Викликає `revalidatePath('/dashboard/contacts')`, щоб скинути кеш сторінки зі списком контактів.
    7.  Клієнт автоматично отримує оновлену сторінку з новим контактом у списку.

*   **Сценарій "Синхронізація офлайн-змін":**
    1.  Клієнтський додаток, відновивши з'єднання, відправляє масив операцій (наприклад, `[{ type: 'create_contact', data: {...} }, { type: 'update_deal', data: {...} }]`) на спеціальний ендпоінт `/api/sync`.
    2.  Серверний обробник цього ендпоінта в циклі проходить по всіх операціях і послідовно виконує їх, використовуючи відповідні Server Actions або сервіси.
    3.  Якщо якась операція завершується помилкою, вона пропускається, а її ID повертається клієнту для подальшої обробки (наприклад, показати помилку користувачу).
    4.  Після успішного виконання клієнт очищує свою локальну чергу синхронізації.

## 7.9. Додаткові аспекти безпеки

*   **Ніколи не довіряти клієнту:** Серверний код ніколи не використовує ідентифікатори організації (`workspace_id`), що передаються з клієнта. ID організації завжди береться з JWT-токена поточної сесії. Це захищає від атак, де зловмисник може спробувати підмінити ID, щоб отримати доступ до чужих даних.
*   **Валідація на сервері:** Усі дані, що надходять від клієнта, проходять обов'язкову валідацію на сервері (наприклад, через Zod), навіть якщо вони вже були провалідовані на клієнті.
*   **Параметризовані запити:** Використання Supabase SDK гарантує, що всі запити до бази даних є параметризованими, що унеможливлює SQL-ін'єкції.