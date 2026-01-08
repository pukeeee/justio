# Розділ 13: Модель Даних та База Даних

## Вступ

Цей документ описує повну структуру бази даних для проєкту CRM4SMB. В основі системи лежить мульти-орендна (multi-tenant) модель даних у PostgreSQL, що забезпечує цілісність, узгодженість та повну ізоляцію даних між різними організаціями.

Архітектура розроблена з урахуванням трьох ключових принципів:

1.  **Безпека:** Дані кожного клієнта (організації) надійно ізольовані за допомогою механізму PostgreSQL **Row Level Security (RLS)**. Це унеможливлює доступ до чужих даних, навіть у випадку помилки в коді.
2.  **Продуктивність:** Для всіх таблиць створено оптимальні індекси, що гарантує швидке виконання запитів навіть при великих обсягах даних.
3.  **Масштабованість:** Гнучка структура з використанням `JSONB` для довільних полів дозволяє легко розширювати функціонал без необхідності змінювати структуру таблиць.

---

## 13.1. Перелічувані Типи (ENUMS)

ENUM — це спеціальний тип даних, який може приймати лише один зі списку можливих значень. Це забезпечує цілісність даних та економить місце.

*   `user_role`: Ролі користувачів (`owner`, `admin`, `manager`, `user`, `guest`).
*   `workspace_user_status`: Статус користувача в організації (`pending`, `active`, `suspended`).
*   `invitation_status`: Статус запрошення до організації (`pending`, `accepted`, `expired`, `cancelled`).
*   `subscription_tier`: Тарифні плани (`free`, `starter`, `pro`, `enterprise`).
*   `subscription_status`: Статус підписки (`trialing`, `active`, `past_due`, `cancelled`).
*   `contact_status`: Статус контакту (`new`, `qualified`, `customer`, `lost`).
*   `company_status`: Статус компанії (`lead`, `active`, 'inactive').
*   `deal_status`: Статус угоди (`open`, `won`, `lost`, `cancelled`).
*   `task_type`: Типи завдань (`call`, `meeting`, `email`, `todo`).
*   `task_status`: Статуси завдань (`pending`, `in_progress`, `completed`, `cancelled`).
*   `task_priority`: Пріоритети завдань (`low`, `medium`, `high`).
*   `activity_type`: Типи подій у стрічці активності (`note`, `call`, `created` тощо).
*   `payment_status`: Статуси платежів (`pending`, `completed`, `failed`, `refunded`).

---

## 13.2. Структура Таблиць

Таблиці згруповані за логічними блоками для кращого розуміння. Для кожної групи надано як опис, так і повний SQL-код для створення таблиць.

### 13.2.1. Ядро Системи (Хто і де працює)

| Таблиця | Призначення | Ключові поля |
| :--- | :--- | :--- |
| `workspaces` | "Акаунт" або "організація" вашого клієнта в системі. | `name` (назва), `slug` (унікальний ідентифікатор в URL), `owner_id` (хто власник). |
| `workspace_users` | Пов'язує користувачів з організаціями. | `workspace_id` (де працює), `user_id` (хто працює), `role` (яка роль), `status`. |
| `workspace_invitations` | Зберігає запрошення для нових користувачів в організацію. | `email` (кого запросили), `role` (яку роль надали), `token` (унікальний токен), `status` (статус запрошення), `expires_at` (термін дії). |

```sql
-- Таблиця для організацій (робочих просторів)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- Для URL, напр: crm.app/w/{slug}
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}', -- Налаштування воронок, полів тощо
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблиця для зв'язку користувачів та організацій
CREATE TABLE workspace_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'owner', 'admin', 'manager', 'user', 'guest'
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  UNIQUE(workspace_id, user_id)
);

-- Таблиця для запрошень користувачів у робочий простір
CREATE TABLE workspace_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE, -- Унікальний, криптографічно безпечний токен
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'cancelled'
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX unique_pending_invitation ON workspace_invitations(workspace_id, email) WHERE (status = 'pending');
```

### 13.2.2. Білінг та Підписки (Все, що стосується грошей)

| Таблиця | Призначення | Ключові поля |
| :--- | :--- | :--- |
| `subscriptions`| Підписка організації на тарифний план. | `tier` (тариф), `status` (статус підписки), `current_period_end` (дата наступної оплати). |
| `payments` | Історія всіх платежів по підписках. | `amount` (сума), `status` (статус платежу), `invoice_url` (посилання на інвойс). |
| `workspace_quotas`| **Лічильники та ліміти.** Зберігає ліміти тарифу (`max_contacts`) та поточне використання (`current_contacts`). | `max_users`, `current_users`, `max_contacts`, `current_contacts` і т.д. |


```sql
-- Таблиця для керування підписками
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'starter', 'pro'
  status TEXT NOT NULL DEFAULT 'trialing', -- 'trialing', 'active', 'past_due', 'cancelled'
  
  -- Інформація від платіжного провайдера
  payment_provider TEXT, -- 'paddle', 'fondy'
  external_subscription_id TEXT, -- ID підписки в зовнішній системі
  
  -- Дати білінгу
  billing_period TEXT, -- 'monthly', 'annual'
  trial_ends_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 13.2.3. CRM-Сутності (Основні робочі інструменти)

| Таблиця | Призначення | Ключові поля |
| :--- | :--- | :--- |
| `contacts` | База контактів (фізичні особи). | `first_name`, `last_name`, `phones`, `emails`, `owner_id` (відповідальний менеджер). |
| `companies` | База компаній (юридичні особи). | `name` (назва), `edrpou` (ЄДРПОУ), `website`. |
| `deals` | Угоди або "продажі". | `title` (назва угоди), `amount` (сума), `pipeline_id` (в якій воронці), `stage_id` (на якому етапі). |
| `pipelines` | Воронки продажів. Це набір етапів, які проходить угода. | `name` (назва воронки), `stages` (JSON-масив з етапами). |
| `tasks` | Завдання для менеджерів. | `title` (назва), `due_date` (термін виконання), `assigned_to` (виконавець). |

```sql
-- Таблиця для компаній (юридичних осіб)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  legal_name TEXT,
  edrpou TEXT, -- ЄДРПОУ/ІПН
  website TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active', -- 'lead', 'active', 'inactive'
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  owner_id UUID REFERENCES auth.users(id),
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для контактів (фізичних осіб)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name || COALESCE(' ' || middle_name, '')) STORED,
  phones JSONB DEFAULT '[]',
  emails JSONB DEFAULT '[]',
  position TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'qualified', 'customer', 'lost'
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  owner_id UUID REFERENCES auth.users(id),
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для воронок продажів
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  stages JSONB NOT NULL, -- [{id, name, order, probability, color}, ...]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблиця для угод
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'UAH',
  probability INT DEFAULT 50,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  expected_close_date DATE,
  actual_close_date DATE,
  status TEXT DEFAULT 'open', -- 'open', 'won', 'lost', 'cancelled'
  lost_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для завдань
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL, -- 'call', 'meeting', 'email', 'todo'
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  reminders JSONB DEFAULT '[]',
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### 13.2.4. Товари та Послуги

| Таблиця | Призначення | Ключові поля |
| :--- | :--- | :--- |
| `products` | Каталог (прайс-лист) товарів та послуг. | `name` (назва), `price` (ціна), `sku` (артикул). |
| `product_categories`| Категорії для товарів для зручного групування. | `name`, `parent_id` (для створення ієрархії). |
| `deal_products` | Товари, додані до конкретної угоди. | `deal_id`, `product_id`, `name`, `quantity` (кількість), `price`. |

```sql
-- Категорії продуктів (ієрархічні)
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT DEFAULT 0
);

-- Таблиця для продуктів та послуг
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  price NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'UAH',
  unit TEXT DEFAULT 'шт.',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для продуктів в угоді (зв'язок багато-до-багатьох)
CREATE TABLE deal_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  price NUMERIC(15,2) NOT NULL, -- Ціна на момент додавання
  discount NUMERIC(5,2) DEFAULT 0, -- Знижка у %
  total NUMERIC(15,2) GENERATED ALWAYS AS (quantity * price * (1 - discount / 100)) STORED,
  notes TEXT
);
```

### 13.2.5. Історія та Аудит

| Таблиця | Призначення | Ключові поля |
| :--- | :--- | :--- |
| `activities` | **Стрічка активності.** Зберігає всю історію дій в системі. | `activity_type`, `content` (опис дії), `user_id` (хто зробив), `contact_id`, `deal_id`. |
| `deal_stage_history`| Історія руху угоди по етапах воронки. | `deal_id`, `from_stage_id`, `to_stage_id`, `duration_seconds`. |
| `product_price_history`| Історія зміни цін на товари для фінансового аудиту. | `product_id`, `old_price`, `new_price`, `changed_by`. |

```sql
-- Універсальна таблиця для відстеження всіх взаємодій
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Історія переміщень по етапах
CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id TEXT,
  to_stage_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
```

### 13.2.6. Допоміжні Таблиці

| Таблиця | Призначення | Ключові поля |
| :--- | :--- | :--- |
| `files` | Інформація про завантажені файли. | `name`, `storage_path`, `uploaded_by`. |
| `notifications` | Сповіщення для користувачів. | `user_id` (кому), `title`, `message`, `is_read`. |
| `integrations` | Налаштування та API-ключі для інтеграцій. | `nova_poshta_api_key`, `smtp_settings`. |

```sql
-- Файли та вкладення
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Шлях у Supabase Storage
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Сповіщення для користувачів
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'task_due', 'deal_stage_changed', 'mention'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT, -- URL для переходу
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблиця для зберігання ключів інтеграцій
CREATE TABLE integrations (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  -- Ключі та налаштування, які мають бути зашифровані
  nova_poshta_api_key TEXT,
  smtp_settings JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
---

## 13.3. Автоматизація: Тригери та Функції

Тригери — це спеціальні процедури, які база даних автоматично виконує при настанні певних подій.

*   `update_updated_at_column()`: Автоматично оновлює поле `updated_at` при будь-якій зміні запису.
*   `update_deal_amount()`: Автоматично перераховує загальну суму угоди (`deals.amount`), коли змінюється склад товарів.
*   `update_workspace_usage()`: Оновлює лічильники використання (`current_contacts`) в таблиці квот.
*   `log_product_price_change()`: Записує історію зміни ціни товару.
*   `create_default_pipeline()`: Створює воронку продажів за замовчуванням для нової організації.
*   `track_deal_stage_change()`: Фіксує час перебування угоди на кожному етапі для аналітики.

```sql
-- Функція для автоматичного оновлення поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Приклад тригеру (потрібно створити для всіх таблиць з полем updated_at)
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функція для автоматичного перерахунку суми угоди
CREATE OR REPLACE FUNCTION update_deal_amount()
RETURNS TRIGGER AS $$
DECLARE
  deal_to_update_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    deal_to_update_id := OLD.deal_id;
  ELSE
    deal_to_update_id := NEW.deal_id;
  END IF;

  UPDATE deals 
  SET amount = (
    SELECT COALESCE(SUM(total), 0) 
    FROM deal_products 
    WHERE deal_id = deal_to_update_id
  )
  WHERE id = deal_to_update_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Тригер, що викликається після зміни в deal_products
CREATE TRIGGER update_deal_amount_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON deal_products
  FOR EACH ROW EXECUTE FUNCTION update_deal_amount();
```
---

## 13.4. Безпека: Row Level Security (RLS)

RLS працює як "сторож" для кожного рядка в таблиці. Перед тим, як віддати дані, він перевіряє, чи має поточний користувач на це право.

**Як це працює у проєкті:**

*   **Ізоляція організацій:** Головне правило для всіх таблиць — `workspace_id = get_current_workspace_id()`. Користувач не може побачити дані, що не належать його організації.
*   **Розмежування за ролями:** Політики також перевіряють роль користувача (напр, `get_current_user_role()`). Наприклад, звичайний користувач бачить **тільки свої** угоди, а менеджер — усі угоди в організації.
*   **Захист від небезпечних операцій:** Наприклад, видалити користувача з організації може тільки `admin` або `owner`.

```sql
-- Вмикаємо RLS для всіх необхідних таблиць
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
-- ... і так далі для всіх таблиць

-- Допоміжна функція для отримання ID організації поточного користувача
CREATE OR REPLACE FUNCTION get_current_workspace_id()
RETURNS UUID AS $$
  SELECT workspace_id 
  FROM workspace_users 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Приклад політики для таблиці контактів
CREATE POLICY "Users can view contacts in their workspace"
ON contacts FOR SELECT
USING (workspace_id = get_current_workspace_id());

CREATE POLICY "Users can insert contacts into their workspace"
ON contacts FOR INSERT
WITH CHECK (workspace_id = get_current_workspace_id());

-- Політика для видимості залежно від ролі
CREATE POLICY "Admins can see all contacts, users only their own"
ON contacts FOR SELECT
USING (
  workspace_id = get_current_workspace_id() AND (
    (SELECT role FROM workspace_users WHERE user_id = auth.uid() AND workspace_id = contacts.workspace_id) IN ('owner', 'admin', 'manager')
    OR
    owner_id = auth.uid()
  )
);
```
---
## 13.5. Оптимізація та Індекси

Індекси дозволяють миттєво знаходити дані у великих таблицях.

*   **Стандартні (B-Tree) індекси:** на всіх полях, за якими відбувається пошук або зв'язок (`workspace_id`, `owner_id`).
*   **Часткові індекси:** наприклад, `WHERE deleted_at IS NULL`. В індекс потрапляють тільки активні записи, що робить його меншим і швидшим.
*   **GIN-індекси:** спеціальні індекси для повнотекстового пошуку (`to_tsvector`) та для пошуку по тегах.
*   **Унікальний частковий індекс (`unique_pending_invitation`):** гарантує, що не можна надіслати два активних запрошення на одну й ту саму пошту.

```sql
-- Приклад індексу для повнотекстового пошуку
CREATE INDEX idx_contacts_search ON contacts USING GIN(
  to_tsvector('simple', full_name || ' ' || COALESCE(position, ''))
);

-- Приклад часткового індексу для активних записів
CREATE INDEX idx_contacts_active ON contacts(workspace_id) WHERE deleted_at IS NULL;
```
---
## 13.6. Стратегія Зберігання та Архівування Даних

*   **М'яке видалення (Soft Delete):** Основні таблиці мають поле `deleted_at`. При видаленні запис не стирається фізично, а лише позначається як видалений.
*   **Жорстке видалення (Hard Delete) та Архівування:** Дані, що були "м'яко" видалені давно (напр., 6 місяців тому), можуть бути переміщені в архівні таблиці за допомогою періодичної задачі (`pg_cron`), а потім видалені фізично.
