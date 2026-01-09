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
*   `activity_type`: Типи подій у стрічці активності (`note`, `call`, `email`, `status_change`, `file_upload`, `created`, `updated`).
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
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- Для URL, напр: crm.app/w/{slug}
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  settings JSONB DEFAULT '{}', -- Налаштування воронок, полів тощо
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для зв'язку користувачів та організацій
CREATE TABLE workspace_users (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  status workspace_user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_workspace_user UNIQUE(workspace_id, user_id)
);

-- Таблиця для запрошень користувачів у робочий простір
CREATE TABLE workspace_invitations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  token TEXT NOT NULL UNIQUE, -- Унікальний, криптографічно безпечний токен
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status invitation_status NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'cancelled'
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX unique_pending_invitation ON workspace_invitations(workspace_id, email) WHERE (status = 'pending');
```

### 13.2.2. Білінг та Підписки (Все, що стосується грошей)

| Таблиця | Призначення | Ключові поля |
| :--- | :--- | :--- |
| `subscriptions`| Підписка організації на тарифний план. | `tier` (тариф), `status` (статус підписки), `current_period_end` (дата наступної оплати), `enabled_modules` (масив увімкнених модулів). |
| `payments` | Історія всіх платежів по підписках. | `amount` (сума), `status` (статус платежу), `invoice_url` (посилання на інвойс). |
| `workspace_quotas`| **Лічильники та ліміти.** Зберігає ліміти тарифу (`max_contacts`) та поточне використання (`current_contacts`). | `max_users`, `current_users`, `max_contacts`, `current_contacts`, `max_deals`, `current_deals`, `max_storage_mb`, `current_storage_mb`. |


```sql
-- Таблиця для керування підписками
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'trialing',
  
  -- Інформація від платіжного провайдера
  payment_provider TEXT, -- 'paddle', 'fondy', 'stripe'
  external_subscription_id TEXT, -- ID підписки в зовнішній системі
  
  -- Дати білінгу
  billing_period TEXT, -- 'monthly', 'annual'
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Додаткові налаштування
  enabled_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблиця для історії платежів
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UAH',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_provider TEXT NOT NULL,
  external_payment_id TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Таблиця для відстеження використання квот
CREATE TABLE workspace_quotas (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  max_users INT NOT NULL DEFAULT 2,
  current_users INT NOT NULL DEFAULT 0,
  max_contacts INT NOT NULL DEFAULT 100,
  current_contacts INT NOT NULL DEFAULT 0,
  max_deals INT NOT NULL DEFAULT 50,
  current_deals INT NOT NULL DEFAULT 0,
  max_storage_mb INT NOT NULL DEFAULT 500,
  current_storage_mb INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  legal_name TEXT,
  edrpou TEXT, -- ЄДРПОУ/ІПН
  website TEXT,
  phone TEXT,
  email TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  status company_status DEFAULT 'active', -- 'lead', 'active', 'inactive'
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  source TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для контактів (фізичних осіб)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name || COALESCE(' ' || middle_name, '')) STORED,
  phones JSONB DEFAULT '[]'::jsonb,
  emails JSONB DEFAULT '[]'::jsonb,
  position TEXT,
  status contact_status DEFAULT 'new', -- 'new', 'qualified', 'customer', 'lost'
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  source TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для воронок продажів
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  stages JSONB NOT NULL DEFAULT '[
    {"id": "new", "name": "Новий", "order": 1, "probability": 10, "color": "#94a3b8"},
    {"id": "qualified", "name": "Кваліфікований", "order": 2, "probability": 25, "color": "#60a5fa"},
    {"id": "proposal", "name": "Пропозиція", "order": 3, "probability": 50, "color": "#a78bfa"},
    {"id": "negotiation", "name": "Переговори", "order": 4, "probability": 75, "color": "#fb923c"},
    {"id": "won", "name": "Виграно", "order": 5, "probability": 100, "color": "#34d399"},
    {"id": "lost", "name": "Програно", "order": 6, "probability": 0, "color": "#f87171"}
  ]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблиця для угод
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE RESTRICT,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'UAH',
  probability INT DEFAULT 50,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  expected_close_date DATE,
  actual_close_date DATE,
  status deal_status DEFAULT 'open', -- 'open', 'won', 'lost', 'cancelled'
  lost_reason TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для завдань
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type task_type NOT NULL, -- 'call', 'meeting', 'email', 'todo'
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status task_status DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority task_priority DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  reminders JSONB DEFAULT '[]'::jsonb,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблиця для продуктів та послуг
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  price NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'UAH',
  unit TEXT DEFAULT 'шт.',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Таблиця для продуктів в угоді (зв'язок багато-до-багатьох)
CREATE TABLE deal_products (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  name TEXT NOT NULL, -- Назва продукту на момент додавання
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
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Історія переміщень по етапах
CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id TEXT,
  to_stage_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Історія змін ціни (для аудиту)
CREATE TABLE product_price_history (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price NUMERIC(15,2),
  new_price NUMERIC(15,2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Шлях у Supabase Storage
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Сповіщення для користувачів
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'task_due', 'deal_stage_changed', 'mention'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT, -- URL для переходу
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблиця для зберігання ключів інтеграцій
CREATE TABLE integrations (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  -- Ключі та налаштування, які мають бути зашифровані
  nova_poshta_api_key TEXT,
  nova_poshta_settings JSONB,
  smtp_settings JSONB,
  sms_settings JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
---

## 13.3. Автоматизація: Тригери та Функції

Тригери — це спеціальні процедури, які база даних автоматично виконує при настанні певних подій.

*   `update_updated_at_column()`: Автоматично оновлює поле `updated_at` при будь-якій зміні запису. Застосовується до всіх таблиць, що мають це поле.
*   `update_deal_amount()`: Автоматично перераховує загальну суму угоди (`deals.amount`), коли змінюється склад товарів у `deal_products`.
*   `update_workspace_usage()`: **(Security Definer)** Оновлює лічильники використання (`current_contacts`, `current_deals` і т.д.) в таблиці `workspace_quotas`. Виконується з правами власника функції для уникнення проблем з рекурсією RLS.
*   `log_product_price_change()`: Записує історію зміни ціни товару в `product_price_history`.
*   `create_default_pipeline_and_quotas()`: Створює воронку продажів за замовчуванням та запис про квоти для нової організації.
*   `track_deal_stage_change()`: Фіксує час перебування угоди на кожному етапі, записуючи дані в `deal_stage_history`.
*   `generate_invitation_token()`: Генерує криптографічно безпечний токен для запрошень.

```sql
-- Функція для автоматичного оновлення поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Приклад тригеру (створюється для всіх таблиць з полем updated_at)
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функція для автоматичного перерахунку суми угоди
CREATE OR REPLACE FUNCTION update_deal_amount()
RETURNS TRIGGER AS $$
DECLARE
  v_deal_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_deal_id := OLD.deal_id;
  ELSE
    v_deal_id := NEW.deal_id;
  END IF;

  UPDATE deals SET amount = (SELECT COALESCE(SUM(total), 0) FROM deal_products WHERE deal_id = v_deal_id) WHERE id = v_deal_id;
  
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deal_amount_trigger AFTER INSERT OR UPDATE OR DELETE ON deal_products
  FOR EACH ROW EXECUTE FUNCTION update_deal_amount();

-- Функція для відстеження зміни етапів угоди
CREATE OR REPLACE FUNCTION track_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO deal_stage_history (deal_id, from_stage_id, to_stage_id, user_id)
    VALUES (NEW.id, OLD.stage_id, NEW.stage_id, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_deal_stage_change_trigger AFTER UPDATE ON deals 
  FOR EACH ROW EXECUTE FUNCTION track_deal_stage_change();
  
-- Функція для оновлення квот (безпечна від рекурсії RLS)
CREATE OR REPLACE FUNCTION public.update_workspace_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Тимчасово вимикаємо RLS, щоб запобігти рекурсії.
  -- Це безпечно, оскільки тригер оновлює лічильники на основі системних подій, а не вводу користувача.
  SET LOCAL row_level_security.enabled = OFF;

  IF TG_TABLE_NAME = 'contacts' THEN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
      UPDATE public.workspace_quotas SET current_contacts = current_contacts + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
      UPDATE public.workspace_quotas SET current_contacts = GREATEST(current_contacts - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'deals' THEN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
      UPDATE public.workspace_quotas SET current_deals = current_deals + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
      UPDATE public.workspace_quotas SET current_deals = GREATEST(current_deals - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'workspace_users' THEN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
      UPDATE public.workspace_quotas SET current_users = current_users + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status != 'active' AND OLD.status = 'active') THEN
      UPDATE public.workspace_quotas SET current_users = GREATEST(current_users - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функція для створення токену запрошення
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
```
---

## 13.4. Безпека: Row Level Security (RLS)

RLS працює як "сторож" для кожного рядка в таблиці. Перед тим, як віддати дані, він перевіряє, чи має поточний користувач на це право. Наша система активно використовує RLS для надійної ізоляції даних між організаціями та розмежування доступу за ролями.

### Ключові концепції

*   **Ізоляція організацій (Multi-tenancy):** Головне правило для всіх таблиць — користувач не може побачити, змінити чи видалити дані, що не належать до його активного робочого простору (`workspace_id`).
*   **Розмежування за ролями:** Політики також перевіряють роль користувача. Наприклад, звичайний користувач (`user`) бачить тільки **свої** угоди, а менеджер (`manager`) — усі угоди в організації.
*   **Захист від небезпечних операцій:** Наприклад, видалити користувача з організації може тільки `admin` або `owner`.

### Запобігання рекурсії: `SECURITY DEFINER` функції

Стандартні політики RLS можуть викликати помилки рекурсії, коли одна політика опосередковано викликає іншу на тій самій таблиці. Щоб уникнути цього, ми використовуємо допоміжні функції з опцією `SECURITY DEFINER`. Вони виконуються з правами власника (а не поточного користувача) і **обходять RLS**, дозволяючи безпечно отримати потрібні дані (роль або факт членства) без ризику циклічних викликів.

```sql
-- Функція для безпечної перевірки, чи є користувач активним членом воркспейсу.
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Обходить RLS завдяки SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_users
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Функція для безпечної перевірки ролі користувача у воркспейсі.
CREATE OR REPLACE FUNCTION public.get_workspace_role(p_workspace_id UUID, p_user_id UUID)
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Обходить RLS завдяки SECURITY DEFINER
  SELECT role INTO v_role
  FROM public.workspace_users
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status = 'active';
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### Приклади актуальних політик

Ось як виглядають політики з використанням цих функцій.

```sql
-- Вмикаємо RLS для всіх необхідних таблиць
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
-- ... і так далі для всіх таблиць

-- Політики для таблиці `workspace_users` (виправлена рекурсія)
CREATE POLICY "Users can view team members in their workspace" ON public.workspace_users
  FOR SELECT USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Admins can insert new users" ON public.workspace_users
  FOR INSERT WITH CHECK (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

-- Політики для таблиці `deals` (з підтримкою "кошика")

-- 1. SELECT: Дозволяє бачити всі угоди (включно з м'яко видаленими) в межах свого воркспейсу.
-- Фільтрація `deleted_at IS NULL` відбувається вже у запитах додатку, а не на рівні RLS.
CREATE POLICY "Users can view deals in their workspace" ON public.deals
  FOR SELECT USING (public.is_workspace_member(workspace_id, auth.uid()));

-- 2. UPDATE: Розділено на USING та WITH CHECK.
CREATE POLICY "Users can update their deals" ON public.deals
  FOR UPDATE
  -- USING: Застосовується ДО оновлення. Дозволяє оновлювати тільки активні (не видалені) угоди.
  USING (
    deleted_at IS NULL AND
    (
      (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin', 'manager')) OR
      deals.owner_id = auth.uid()
    )
  )
  -- WITH CHECK: Застосовується ПІСЛЯ оновлення. Перевіряє права, але не стан `deleted_at`.
  -- Це дозволяє виконати операцію `UPDATE ... SET deleted_at = NOW()`, тобто м'яке видалення.
  WITH CHECK (
    (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin', 'manager')) OR
     deals.owner_id = auth.uid()
  );

-- 3. INSERT: Дозволяє створювати угоди відповідним ролям.
CREATE POLICY "Users can create deals" ON public.deals 
  FOR INSERT WITH CHECK (
    public.is_workspace_member(workspace_id, auth.uid()) AND
    public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin', 'manager', 'user')
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
