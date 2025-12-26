# Розділ 6: Модель Даних (PostgreSQL)

В основі системи лежить мульти-орендна (multi-tenant) модель даних у PostgreSQL, що забезпечує цілісність, узгодженість та повну ізоляцію даних між різними організаціями. Кожна таблиця, що містить специфічні для клієнта дані, має поле `workspace_id` та захищена політиками Row Level Security (RLS).

## 6.1. Ключові Сутності та Схема

### 6.1.1. Мульти-орендність (Multi-tenancy)

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
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  UNIQUE(workspace_id, user_id)
);

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
  trial_ends_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

### 6.1.2. Клієнти (Contacts & Companies)

```sql
-- Таблиця для компаній (юридичних осіб)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  legal_name TEXT,
  edrpou TEXT, -- ЄДРПОУ/ІПН
  website TEXT,
  -- Контактна інформація
  phone TEXT,
  email TEXT,
  -- CRM-поля
  status TEXT DEFAULT 'active', -- 'lead', 'active', 'inactive'
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  owner_id UUID REFERENCES auth.users(id),
  -- Кастомні поля
  custom_fields JSONB DEFAULT '{}',
  -- Мета-дані
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Для м'якого видалення
);

-- Таблиця для контактів (фізичних осіб)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  -- Персональна інформація
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    first_name || ' ' || last_name || COALESCE(' ' || middle_name, '')
  ) STORED,
  -- Контактні дані
  phones JSONB DEFAULT '[]', -- [{type: 'mobile', number: '+380...', primary: true}]
  emails JSONB DEFAULT '[]', -- [{type: 'work', email: '...', primary: true}]
  -- Інформація про роботу
  position TEXT,
  -- CRM-поля
  status TEXT DEFAULT 'new', -- 'new', 'qualified', 'customer', 'lost'
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  owner_id UUID REFERENCES auth.users(id),
  -- Кастомні поля
  custom_fields JSONB DEFAULT '{}',
  -- Мета-дані
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### 6.1.3. Угоди та Воронки (Deals & Pipelines)

```sql
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
  stage_id TEXT NOT NULL, -- ID етапу з pipelines.stages
  -- Основна інформація
  title TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'UAH',
  probability INT DEFAULT 50, -- 0-100
  -- Відносини
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  -- Дати
  expected_close_date DATE,
  actual_close_date DATE,
  -- Статус
  status TEXT DEFAULT 'open', -- 'open', 'won', 'lost', 'cancelled'
  lost_reason TEXT,
  -- Мета-дані
  created_by UUID REFERENCES auth.users(id),
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
```

### 6.1.4. Завдання (Tasks)

```sql
-- Таблиця для завдань
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Деталі завдання
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL, -- 'call', 'meeting', 'email', 'todo'
  
  -- Призначення
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  
  -- Статус
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  
  -- Час
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Нагадування
  reminders JSONB DEFAULT '[]', -- [{time: '15m', sent: false}, ...]
  
  -- Відносини
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  
  -- Мета-дані
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### 6.1.5. Продукти (Products)

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
  -- Інформація про продукт
  name TEXT NOT NULL,
  sku TEXT, -- Артикул
  description TEXT,
  -- Ціноутворення
  price NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'UAH',
  unit TEXT DEFAULT 'шт.',
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  -- Мета-дані
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
```

### 6.1.6. Історія активності (Activity Timeline)

```sql
-- Універсальна таблиця для відстеження всіх взаємодій
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  -- Тип активності
  activity_type TEXT NOT NULL, -- 'note', 'call', 'email', 'status_change', 'file_upload'
  -- Вміст
  content TEXT,
  metadata JSONB DEFAULT '{}', -- Додаткові дані, залежно від типу
  -- Відносини
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  -- Користувач
  user_id UUID NOT NULL REFERENCES auth.users(id),
  -- Час
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.1.7. Файли та Сповіщення

```sql
-- Файли та вкладення
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  -- Інформація про файл
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Шлях у Supabase Storage
  -- Відносини
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  -- Мета-дані
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Сповіщення для користувачів
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Сповіщення
  type TEXT NOT NULL, -- 'task_due', 'deal_stage_changed', 'mention'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT, -- URL для переходу
  -- Статус
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  -- Мета-дані
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 6.2. Політики Безпеки на Рівні Рядків (RLS)

**Критично:** Всі таблиці, що містять дані організації, повинні мати RLS-політики для забезпечення ізоляції.

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
USING (
  workspace_id = get_current_workspace_id()
);

CREATE POLICY "Users can insert contacts into their workspace"
ON contacts FOR INSERT
WITH CHECK (
  workspace_id = get_current_workspace_id()
);

-- Політика для видимості залежно від ролі
CREATE POLICY "Admins can see all contacts, users only their own"
ON contacts FOR SELECT
USING (
  workspace_id = get_current_workspace_id() AND (
    -- Адмін/Власник/Менеджер бачать все
    (SELECT role FROM workspace_users WHERE user_id = auth.uid() AND workspace_id = contacts.workspace_id) IN ('owner', 'admin', 'manager')
    OR
    -- Користувач бачить лише контакти, де він є відповідальним
    owner_id = auth.uid()
  )
);
```
**Примітка:** Аналогічні політики мають бути створені для всіх інших таблиць з даними організацій.

## 6.3. Тригери та Функції Бази Даних

Для автоматизації бізнес-логіки використовуються тригери.

```sql
-- Функція для автоматичного оновлення поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер, що викликає функцію перед оновленням запису
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Цей тригер потрібно застосувати до всіх таблиць, де є поле updated_at.

-- Функція для автоматичного перерахунку суми угоди при зміні продуктів
CREATE OR REPLACE FUNCTION update_deal_amount()
RETURNS TRIGGER AS $$
DECLARE
  deal_to_update_id UUID;
BEGIN
  -- Визначаємо deal_id в залежності від операції (INSERT, UPDATE, DELETE)
  IF TG_OP = 'DELETE' THEN
    deal_to_update_id := OLD.deal_id;
  ELSE
    deal_to_update_id := NEW.deal_id;
  END IF;

  -- Оновлюємо поле amount в таблиці deals
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

-- Тригер, що викликається після будь-якої зміни в deal_products
CREATE TRIGGER update_deal_amount_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON deal_products
  FOR EACH ROW EXECUTE FUNCTION update_deal_amount();
```

## 6.4. Стратегія Індексації

Для забезпечення високої продуктивності запитів, індекси створюються для:
1.  **Зовнішніх ключів (Foreign Keys):** Більшість створюється автоматично.
2.  **Полів для частої фільтрації:** `status`, `tags`, `due_date`.
3.  **Полів для сортування:** `created_at`, `name`, `amount`.
4.  **Повнотекстового пошуку (GIN indexes):** для полів `name`, `description`.
5.  **Полів JSONB (GIN indexes):** для `custom_fields`.

```sql
-- Приклад індексу для повнотекстового пошуку
CREATE INDEX idx_contacts_search ON contacts USING GIN(
  to_tsvector('simple', full_name || ' ' || COALESCE(position, ''))
);

-- Приклад часткового індексу для активних записів
CREATE INDEX idx_contacts_active ON contacts(workspace_id) WHERE deleted_at IS NULL;
```

## 6.5. Зберігання та Архівування Даних

*   **М'яке видалення (Soft Delete):** Основні таблиці мають поле `deleted_at`. При видаленні запис не стирається фізично, а лише позначається як видалений. Запити до даних завжди містять умову `WHERE deleted_at IS NULL`.
*   **Жорстке видалення (Hard Delete) та Архівування:** Для довгострокового зберігання та дотримання політик, дані, що були "м'яко" видалені давно (напр., 6 місяців тому), можуть бути переміщені в окремі архівні таблиці (`archived_contacts`) за допомогою періодичної задачі (`pg_cron`), а потім видалені фізично.